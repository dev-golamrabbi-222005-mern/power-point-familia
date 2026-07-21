import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db.js';

export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    return NextResponse.json(db.settings || { mealRate: 45 });
  } catch (error) {
    console.error('Fetch settings error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = authenticate(req, ['admin']);
    if (error) return error;

    const { mealRate } = await req.json();

    if (mealRate === undefined || Number(mealRate) <= 0) {
      return NextResponse.json(
        { message: 'A valid meal rate greater than 0 is required.' },
        { status: 400 }
      );
    }

    await ensureDbInit();
    const db = getDb();
    db.settings = { mealRate: Number(mealRate) };
    saveDb(db);

    return NextResponse.json({
      settings: db.settings,
      message: 'Meal rate settings updated successfully.'
    });
  } catch (error) {
    console.error('Settings update error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
