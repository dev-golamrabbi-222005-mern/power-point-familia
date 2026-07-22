import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
import { RefundRequest } from '@/src/types';

// GET: Fetch all meal refunds (manager/admin view)
export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Get refunds that were initiated by manager/admin (type = 'meal_refund')
    const mealRefunds = db.refundRequests.filter(r => r.reason?.startsWith('[MEAL REFUND]'));
    
    const enriched = mealRefunds.map(r => {
      const u = db.users.find(usr => usr.id === r.userId);
      return {
        ...r,
        userName: u ? u.name : 'Unknown',
        userEmail: u ? u.email : undefined,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Fetch meal refunds error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// POST: Initiate a meal refund for a member (manager/admin)
export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { userId, amount, reason, paymentMethod, mobileNumber } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: 'userId and a positive amount are required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    // Verify user exists
    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Calculate member's balance
    const userDeposits = db.deposits
      .filter(d => d.userId === userId && d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);
    const userMeals = db.records
      .filter(r => r.userId === userId)
      .reduce((sum, r) => sum + r.count, 0);
    const baseRate = db.settings?.mealRate || 45;
    const totalMealsCost = db.records.reduce((sum, r) => sum + r.count, 0);
    const totalMenuCost = db.menus.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
    const liveRate = totalMealsCost > 0 && totalMenuCost > 0
      ? Math.round((totalMenuCost / totalMealsCost) * 100) / 100
      : baseRate;
    const mealCost = Math.round(userMeals * liveRate * 100) / 100;
    const balance = Math.round((userDeposits - mealCost) * 100) / 100;

    if (amount > balance) {
      return NextResponse.json(
        { message: `Insufficient balance. ${targetUser.name} has ${balance}৳ available.` },
        { status: 400 }
      );
    }

    const newRefund: RefundRequest = {
      id: `refund-${Date.now()}`,
      userId,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      reason: `[MEAL REFUND] ${reason || 'Manager-initiated meal refund'}`,
      paymentMethod: paymentMethod || 'Cash',
      mobileNumber: mobileNumber || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.refundRequests.push(newRefund);
    saveDb(db);

    return NextResponse.json({
      refund: { ...newRefund, userName: targetUser.name },
      message: `Meal refund of ${amount}৳ initiated for ${targetUser.name}. Awaiting approval.`
    }, { status: 201 });
  } catch (error) {
    console.error('Meal refund error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
