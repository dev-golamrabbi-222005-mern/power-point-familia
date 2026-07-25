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
    const todayMyMeals = db.records
      .filter(r => r.userId === userId && r.date === today)
      .reduce((sum, r) => sum + r.count, 0);

    // Mess total meal (all members)
    const messTotalMeals = allMealsCount;

    // Today's mess meal
    const todayMessMeals = db.records
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      myTotalMeals,
      todayMyMeals,
      messTotalMeals,
      todayMessMeals,
      liveMealRate,
      today,
    });
  } catch (error) {
    console.error('Member overview fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
