import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    if (user!.role === 'manager' || user!.role === 'admin') {
      // Managers/Admins can see all records
      return NextResponse.json(db.records);
    } else {
      // Members see only their own
      return NextResponse.json(db.records.filter(r => r.userId === user!.id));
    }
  } catch (error) {
    console.error('Fetch records error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
