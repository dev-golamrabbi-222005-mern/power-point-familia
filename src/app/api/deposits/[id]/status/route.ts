import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { FixedUtilityType, MemberBillPayment } from '@/src/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { id } = await params;
    const { status } = await req.json(); // 'approved' | 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Status must be approved or rejected.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    const depIndex = db.deposits.findIndex(d => d.id === id);

    if (depIndex === -1) {
      return NextResponse.json({ message: 'Ticket record not found.' }, { status: 404 });
    }

    const targetDeposit = db.deposits[depIndex];
    const prevStatus = targetDeposit.status;
    targetDeposit.status = status;

    // If newly approved: update manager total cash in hand and utility status if fixed bill
    if (status === 'approved' && prevStatus !== 'approved') {
      if (typeof db.settings.currentPairIndex === 'number' && typeof (db.settings as any).totalCashInHand !== 'number') {
        (db.settings as any).totalCashInHand = 0;
      }

      if (targetDeposit.amount > 0) {
        (db.settings as any).totalCashInHand = ((db.settings as any).totalCashInHand || 0) + targetDeposit.amount;
      }

      // Check if it's a fixed utility ticket
      const remarks = targetDeposit.remarks || '';
      const currentMonth = new Date().toISOString().slice(0, 7);

      let utilityType: FixedUtilityType | null = null;
      if (remarks.includes('Rent') || remarks.includes('Basha Vara')) utilityType = 'rent';
      else if (remarks.includes('Electricity') || remarks.includes('Current Bill')) utilityType = 'electricity';
      else if (remarks.includes('WiFi')) utilityType = 'wifi';
      else if (remarks.includes('Gas')) utilityType = 'gas';
      else if (remarks.includes('Servant')) utilityType = 'servant_fee';

      if (utilityType) {
        // Record payment in memberBillPayments
        const existingPayment = db.memberBillPayments.find(
          p => p.userId === targetDeposit.userId && p.month === currentMonth && p.type === utilityType
        );

        if (!existingPayment) {
          const newPayment: MemberBillPayment = {
            id: `mbp-${Date.now()}`,
            userId: targetDeposit.userId,
            month: currentMonth,
            type: utilityType,
            amount: targetDeposit.amount,
            paidAt: new Date().toISOString(),
            depositId: targetDeposit.id,
            userName: targetDeposit.userName,
          };
          db.memberBillPayments.push(newPayment);
        }
      }
    }

    saveDb(db);

    return NextResponse.json({
      deposit: db.deposits[depIndex],
      message: `Ticket successfully ${status}.`,
    });
  } catch (error) {
    console.error('Deposit status update error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
