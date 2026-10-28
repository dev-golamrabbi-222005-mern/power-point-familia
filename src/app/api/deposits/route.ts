import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { Deposit } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    
    if (user!.role === 'manager' || user!.role === 'admin') {
      // Return all deposits with user details attached
      const enrichedDeposits = db.deposits.map(d => {
        const u = db.users.find(usr => usr.id === d.userId);
        return {
          ...d,
          userName: u ? u.name : 'Unknown User',
          userEmail: u ? u.email : '',
        };
      });
      return NextResponse.json(enrichedDeposits);
    } else {
      // Regular members see only theirs
      return NextResponse.json(db.deposits.filter(d => d.userId === user!.id));
    }
  } catch (error) {
    console.error('Fetch deposits error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { userId, amount, date, paymentMethod, transactionId, remarks, type, utilityType, month } = await req.json();

    const targetUserId = (user!.role === 'member' || !userId)
      ? user!.id
      : userId;

    const depositDate = date || new Date().toISOString().split('T')[0];

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: 'Payment amount must be greater than 0.' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'Payment method is required.' },
        { status: 400 }
      );
    }

    if (!transactionId || !transactionId.toString().trim()) {
      return NextResponse.json(
        { message: 'Transaction ID or Reference number is required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    const memberObj = db.users.find(u => u.id === targetUserId);

    const isFixedCost = type === 'fixed_cost' || Boolean(utilityType) || (remarks && remarks.toLowerCase().includes('fixed'));

    const newDeposit: Deposit & { utilityType?: string; month?: string } = {
      id: `dep-${Date.now()}`,
      userId: targetUserId,
      userName: memberObj ? memberObj.name : user!.name,
      amount: Number(amount),
      date: depositDate,
      paymentMethod,
      transactionId: transactionId.toString().trim(),
      status: 'pending',
      type: type || (isFixedCost ? 'fixed_cost' : 'meal_cash'),
      remarks: remarks || (isFixedCost ? 'Fixed Expense Payment' : 'Meal Cash Deposit'),
      utilityType: utilityType || (isFixedCost && type !== 'fixed_cost' ? type : undefined),
      month: month || depositDate.slice(0, 7),
    };

    db.deposits.push(newDeposit);
    await saveDb(db);

    return NextResponse.json({
      deposit: newDeposit,
      message: 'Payment ticket submitted successfully! Awaiting manager verification.'
    }, { status: 201 });
  } catch (error) {
    console.error('Deposit submission error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
