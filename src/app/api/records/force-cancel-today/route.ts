import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    const { mealType } = await req.json(); // 'lunch' | 'dinner' | 'both'
    const today = new Date().toISOString().split('T')[0];

    await ensureDbInit();
    const db = getDb();

    let countCancelled = 0;

    db.records.forEach(r => {
      if (r.date === today) {
        if (!mealType || mealType === 'both' || r.mealType === mealType) {
          if (r.count > 0) {
            r.count = 0;
            countCancelled++;
          }
        }
      }
    });

    saveDb(db);

    return NextResponse.json({
      message: `Forcefully cancelled today's ${mealType || 'all'} meals. Total records reset: ${countCancelled}.`,
    });
  } catch (err: any) {
    console.error('Force cancel today error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
