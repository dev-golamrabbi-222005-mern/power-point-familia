import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Set 1-hour visibility window
    const durationMinutes = 60;
    const visibilityUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    db.settings.financeVisibilityUntil = visibilityUntil;
    db.settings.financeVisibilityDurationMinutes = durationMinutes;

    saveDb(db);

    return NextResponse.json({
      message: `Finance calculation released for ${durationMinutes} minutes.`,
      financeVisibilityUntil: visibilityUntil,
    });
  } catch (error) {
    console.error('Toggle finance visibility error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
