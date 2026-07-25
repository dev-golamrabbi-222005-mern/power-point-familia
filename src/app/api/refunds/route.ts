import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { RefundRequest } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    if (user!.role === 'manager' || user!.role === 'admin') {
      // Enriched with user details for managers/admins
      const enriched = db.refundRequests.map(r => {
        const u = db.users.find(usr => usr.id === r.userId);
        return { ...r, userName: u ? u.name : 'Unknown', userEmail: u ? u.email : '' };
      });
      return NextResponse.json(enriched);
    } else {
      // Members see only their own
      const enriched = db.refundRequests
        .filter(r => r.userId === user!.id)
        .map(r => {
          const u = db.users.find(usr => usr.id === r.userId);
          return { ...r, userName: u ? u.name : 'Unknown', userEmail: u ? u.email : '' };
        });
      return NextResponse.json(enriched);
    }
  } catch (error) {
    console.error('Fetch refunds error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { amount, date, reason, paymentMethod, mobileNumber } = await req.json();

    if (!amount || !reason || !paymentMethod) {
      return NextResponse.json(
        { message: 'amount, reason, and paymentMethod are required.' },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    // Verify user has sufficient balance (approved deposits - meal cost)
    const approvedDeposits = db.deposits
      .filter(d => d.userId === user!.id && d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);
    const totalMeals = db.records
      .filter(r => r.userId === user!.id)
      .reduce((sum, r) => sum + r.count, 0);
    const mealRate = db.settings?.mealRate || 45;
    const mealCost = totalMeals * mealRate;
    const balance = approvedDeposits - mealCost;

    if (Number(amount) > balance) {
      return NextResponse.json(
        { message: `Insufficient balance. Your available balance is ${balance.toFixed(0)}৳.` },
        { status: 400 }
      );
    }

    const newRefund: RefundRequest = {
      id: `refund-${Date.now()}`,
      userId: user!.id,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      reason,
      paymentMethod,
      mobileNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.refundRequests.push(newRefund);
    saveDb(db);

    return NextResponse.json({
      refund: newRefund,
      message: 'Money-back request submitted! Waiting for Manager/Admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Create refund error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
