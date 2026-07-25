import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { status, remarks } = await req.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Status must be "approved" or "rejected".' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();

    const refundIndex = db.refundRequests.findIndex(r => r.id === id);
    if (refundIndex === -1) {
      return NextResponse.json({ message: 'Refund request not found.' }, { status: 404 });
    }

    db.refundRequests[refundIndex].status = status;
    db.refundRequests[refundIndex].processedAt = new Date().toISOString();
    db.refundRequests[refundIndex].processedBy = user!.id;
    if (remarks) db.refundRequests[refundIndex].remarks = remarks;

    // If approved, deduct the amount from user's deposits (create a negative deposit record)
    if (status === 'approved') {
      const refund = db.refundRequests[refundIndex];
      db.deposits.push({
        id: `dep-refund-${Date.now()}`,
        userId: refund.userId,
        amount: -refund.amount, // Negative amount to represent money going out
        date: new Date().toISOString().split('T')[0],
        paymentMethod: refund.paymentMethod,
        transactionId: `REFUND-${refund.id}`,
        status: 'approved',
        remarks: `Money-back refund: ${refund.reason}`,
      });
    }

    saveDb(db);

    return NextResponse.json({
      refund: db.refundRequests[refundIndex],
      message: `Refund request ${status} successfully.`
    });
  } catch (error) {
    console.error('Update refund status error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
