import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';

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
      return NextResponse.json({ message: 'Deposit record not found.' }, { status: 404 });
    }

    db.deposits[depIndex].status = status;
    saveDb(db);

    return NextResponse.json({
      deposit: db.deposits[depIndex],
      message: `Deposit request successfully ${status}.`
    });
  } catch (error) {
    console.error('Deposit status update error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
