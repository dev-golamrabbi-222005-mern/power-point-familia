import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { targetUserId, title, message, deadlineDate, category } = await req.json();

    if (!targetUserId || !title || !message) {
      return NextResponse.json({ message: 'Target user, title, and message are required.' }, { status: 400 });
    }

    await ensureDbInit();
    const db = getDb();

    // Create warning deposit/ticket record
    const warningTicket = {
      id: `warn-${Date.now()}`,
      userId: targetUserId,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Notice / Warning',
      transactionId: `WARN-${Date.now()}`,
      status: 'pending',
      remarks: `[${category || 'Warning'}] ${title}: ${message} (Deadline: ${deadlineDate || 'ASAP'})`,
      userName: db.users.find(u => u.id === targetUserId)?.name || 'Member',
    };

    db.deposits.push(warningTicket as any);
    saveDb(db);

    return NextResponse.json({
      message: 'Warning ticket issued to member successfully.',
      ticket: warningTicket,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Send warning ticket error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
