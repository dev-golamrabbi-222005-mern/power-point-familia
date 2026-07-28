import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const userId = user!.id;
    const today = new Date().toISOString().split('T')[0];

    // Calculate LIVE meal rate: Total Approved Bazaar Expense / Total Meals by all members
    const allMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);
    const totalBazaarExpenses = db.bazaarExpenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.totalCost, 0);
    
    const baseRate = db.settings?.mealRate || 45;
    const liveMealRate = allMealsCount > 0 && totalBazaarExpenses > 0
      ? Math.round((totalBazaarExpenses / allMealsCount) * 100) / 100
      : baseRate;

    // My total meal (all time)
    const myTotalMeals = db.records
      .filter(r => r.userId === userId)
      .reduce((sum, r) => sum + r.count, 0);

    // Today's my meal
    const todayMyLunch = db.records
      .filter(r => r.userId === userId && r.date === today && r.mealType === 'lunch')
      .reduce((sum, r) => sum + r.count, 0);

    const todayMyDinner = db.records
      .filter(r => r.userId === userId && r.date === today && r.mealType === 'dinner')
      .reduce((sum, r) => sum + r.count, 0);

    const todayMyMeals = todayMyLunch + todayMyDinner;

    // Mess total meal (all members)
    const messTotalMeals = allMealsCount;

    // Today's mess meal
    const todayMessLunch = db.records
      .filter(r => r.date === today && r.mealType === 'lunch')
      .reduce((sum, r) => sum + r.count, 0);

    const todayMessDinner = db.records
      .filter(r => r.date === today && r.mealType === 'dinner')
      .reduce((sum, r) => sum + r.count, 0);

    const todayMessMeals = todayMessLunch + todayMessDinner;

    return NextResponse.json({
      myTotalMeals,
      todayMyMeals,
      todayMyLunch,
      todayMyDinner,
      messTotalMeals,
      todayMessMeals,
      todayMessLunch,
      todayMessDinner,
      liveMealRate,
      today,
    });
  } catch (error) {
    console.error('Member overview fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
