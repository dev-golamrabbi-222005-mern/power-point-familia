import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { MemberBillPayment } from '@/src/types';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['member', 'manager', 'admin']);
    if (error) return error;

    const { month, type, amount, depositId } = await req.json();

    if (!month || !type || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: 'month, type, and amount (>0) are required.' },
        { status: 400 }
      );
    }

    if (!['rent', 'electricity', 'wifi', 'servant_fee'].includes(type)) {
      return NextResponse.json({ message: 'Invalid bill type.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    const newPayment: MemberBillPayment = {
      id: `billpay-${Date.now()}`,
      userId: user!.id,
      month,
      type,
      amount: Number(amount),
      paidAt: new Date().toISOString(),
      depositId: depositId || undefined,
    };

    db.memberBillPayments.push(newPayment);
    saveDb(db);

    return NextResponse.json({
      payment: newPayment,
      message: `Payment of ${amount}৳ allocated to ${type.replace('_', ' ')}.`
    }, { status: 201 });
  } catch (error) {
    console.error('Utility payment error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    const payments = db.memberBillPayments.map(p => {
      const u = db.users.find(usr => usr.id === p.userId);
      return { ...p, userName: u ? u.name : 'Unknown' };
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Fetch bill payments error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
