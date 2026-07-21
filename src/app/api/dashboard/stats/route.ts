import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const userId = user!.id;
    const userRole = user!.role;
    const mealRate = db.settings?.mealRate || 45;

    // A: Calculate Member statistics (approved deposits, consumed/booked meals)
    const userDeposits = db.deposits.filter(d => d.userId === userId);
    const totalDeposits = userDeposits
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);
    
    const pendingDeposits = userDeposits
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0);

    const userMealRecords = db.records.filter(r => r.userId === userId);
    const totalMealsCount = userMealRecords.reduce((sum, r) => sum + r.count, 0);
    const totalMealCost = totalMealsCount * mealRate;
    const totalBalance = totalDeposits - totalMealCost;

    const stats: any = {
      userStats: {
        totalBalance,
        totalDeposits,
        totalMealsCount,
        totalMealCost,
        pendingDeposits,
      }
    };

    // B: Calculate System-wide Manager/Admin aggregates if role fits
    if (userRole === 'manager' || userRole === 'admin') {
      const allApprovedDeposits = db.deposits
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

      const allPendingDepositsCount = db.deposits.filter(d => d.status === 'pending').length;
      
      const allMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);
      const allMealCost = allMealsCount * mealRate;
      const totalSystemBalance = allApprovedDeposits - allMealCost;

      const membersCount = db.users.filter(u => u.role === 'member' && u.status === 'approved').length;
      const activeMenuCount = db.menus.length;

      stats.managerStats = {
        totalSystemBalance,
        totalSystemDeposits: allApprovedDeposits,
        totalSystemMealsCount: allMealsCount,
        totalSystemMealCost: allMealCost,
        pendingDepositsCount: allPendingDepositsCount,
        membersCount,
        activeMenuCount
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
