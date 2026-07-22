import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth.js';
import { getDb, ensureDbInit } from '@/src/lib/db.js';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    const baseRate = db.settings?.mealRate || 45;

    // Calculate LIVE meal rate
    const allMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);
    const totalMenuCost = db.menus.reduce((sum, m) => sum + (m.estimatedCost || 0), 0);
    const liveMealRate = allMealsCount > 0 && totalMenuCost > 0
      ? Math.round((totalMenuCost / allMealsCount) * 100) / 100
      : baseRate;

    // ===== Monthly Snapshots =====
    const monthMap = new Map<string, {
      deposits: number;
      mealsCount: number;
      bazaarExpenses: number;
      refundsApproved: number;
      members: Set<string>;
    }>();

    const addToMonth = (dateStr: string, cb: (entry: { deposits: number; mealsCount: number; bazaarExpenses: number; refundsApproved: number; members: Set<string> }) => void) => {
      const month = dateStr.slice(0, 7);
      if (!monthMap.has(month)) {
        monthMap.set(month, { deposits: 0, mealsCount: 0, bazaarExpenses: 0, refundsApproved: 0, members: new Set() });
      }
      cb(monthMap.get(month)!);
    };

    // Aggregate approved deposits
    db.deposits.filter(d => d.status === 'approved').forEach(d => {
      addToMonth(d.date, e => { e.deposits += d.amount; if (d.userId) e.members.add(d.userId); });
    });

    // Aggregate meal records
    db.records.forEach(r => {
      addToMonth(r.date, e => { e.mealsCount += r.count; if (r.userId) e.members.add(r.userId); });
    });

    // Aggregate approved bazaar expenses
    db.bazaarExpenses.filter(e => e.status === 'approved').forEach(e => {
      addToMonth(e.date, entry => { entry.bazaarExpenses += e.totalCost; });
    });

    // Aggregate approved refunds
    db.refundRequests.filter(r => r.status === 'approved').forEach(r => {
      addToMonth(r.createdAt, e => { e.refundsApproved += r.amount; });
    });

    const months = Array.from(monthMap.entries()).sort(([a], [b]) => b.localeCompare(a));

    const monthlySnapshots = months.map(([month, data]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      deposits: data.deposits,
      mealsCount: data.mealsCount,
      mealCost: Math.round(data.mealsCount * liveMealRate * 100) / 100,
      bazaarExpenses: data.bazaarExpenses,
      refundsApproved: data.refundsApproved,
      netBalance: Math.round((data.deposits - (data.mealsCount * liveMealRate) - data.bazaarExpenses - data.refundsApproved) * 100) / 100,
      memberCount: data.members.size,
    }));

    // ===== Per-Member Deposit Breakdown (current month) =====
    const currentMonth = new Date().toISOString().slice(0, 7);
    const memberDeposits = db.deposits
      .filter(d => d.date.startsWith(currentMonth) && d.status === 'approved');

    // Aggregate per member
    const depositByMember = new Map<string, { name: string; totalDeposited: number; depositCount: number }>();
    memberDeposits.forEach(d => {
      const u = db.users.find(usr => usr.id === d.userId);
      const name = u ? u.name : 'Unknown User';
      if (!depositByMember.has(d.userId)) {
        depositByMember.set(d.userId, { name, totalDeposited: 0, depositCount: 0 });
      }
      const entry = depositByMember.get(d.userId)!;
      entry.totalDeposited += d.amount;
      entry.depositCount += 1;
    });

    const perMemberDeposits = Array.from(depositByMember.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalDeposited: data.totalDeposited,
        depositCount: data.depositCount,
      }))
      .sort((a, b) => b.totalDeposited - a.totalDeposited);

    // ===== Current month totals =====
    const currentMonthDeposits = monthlySnapshots.find(s => s.month === currentMonth);

    return NextResponse.json({
      monthlySnapshots,
      perMemberDeposits,
      currentMonth: {
        month: currentMonth,
        label: currentMonthDeposits?.label || new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        totalDeposits: currentMonthDeposits?.deposits || 0,
        totalMealCost: currentMonthDeposits?.mealCost || 0,
        totalBazaarExpenses: currentMonthDeposits?.bazaarExpenses || 0,
        totalRefunds: currentMonthDeposits?.refundsApproved || 0,
        netBalance: currentMonthDeposits?.netBalance || 0,
        memberCount: currentMonthDeposits?.memberCount || 0,
      },
    });
  } catch (error) {
    console.error('Ledger fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
