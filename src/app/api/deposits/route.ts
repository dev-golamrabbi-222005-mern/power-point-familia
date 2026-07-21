import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';
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
    const { error, user } = authenticate(req, ['member']);
    if (error) return error;

    const { amount, date, paymentMethod, transactionId, remarks } = await req.json();

    if (!amount || !date || !paymentMethod || !transactionId) {
      return NextResponse.json(
        { message: 'amount, date, paymentMethod, and transactionId are required.' },
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
    const newDeposit: Deposit = {
      id: `dep-${Date.now()}`,
      userId: user!.id,
      amount: Number(amount),
      date,
      paymentMethod,
      transactionId,
      status: 'pending',
      remarks,
    };

    db.deposits.push(newDeposit);
    saveDb(db);

    return NextResponse.json({
      deposit: newDeposit,
      message: 'Deposit request submitted successfully. Waiting for Manager/Admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Deposit submission error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
