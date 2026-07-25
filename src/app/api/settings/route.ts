import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';

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
    const { error, user } = authenticate(req, ['admin', 'manager']);
    if (error) return error;

    const body = await req.json();
    const { mealRate, weeklyPayment, initialWeekPayment, monthlyFlatRate, startWeekDate, autoBookMeals, bazaarRotationIndex } = body;

    await ensureDbInit();
    const db = getDb();
    
    // Update only the provided settings fields
    if (mealRate !== undefined && Number(mealRate) > 0) {
      db.settings.mealRate = Number(mealRate);
    }
    if (weeklyPayment !== undefined && Number(weeklyPayment) > 0) {
      db.settings.weeklyPayment = Number(weeklyPayment);
    }
    if (initialWeekPayment !== undefined && Number(initialWeekPayment) > 0) {
      db.settings.initialWeekPayment = Number(initialWeekPayment);
    }
    if (monthlyFlatRate !== undefined && Number(monthlyFlatRate) > 0) {
      db.settings.monthlyFlatRate = Number(monthlyFlatRate);
    }
    if (startWeekDate !== undefined) {
      db.settings.startWeekDate = startWeekDate;
    }
    if (autoBookMeals !== undefined) {
      db.settings.autoBookMeals = Boolean(autoBookMeals);
    }
    if (bazaarRotationIndex !== undefined) {
      db.settings.currentPairIndex = Number(bazaarRotationIndex);
    }
    if (body.financeVisibilityUntil !== undefined) {
      db.settings.financeVisibilityUntil = body.financeVisibilityUntil;
    }
    if (body.financeVisibilityDurationMinutes !== undefined) {
      db.settings.financeVisibilityDurationMinutes = Number(body.financeVisibilityDurationMinutes);
    }
    saveDb(db);

    return NextResponse.json({
      settings: db.settings,
      message: 'System settings updated successfully.'
    });
  } catch (error) {
    console.error('Settings update error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
