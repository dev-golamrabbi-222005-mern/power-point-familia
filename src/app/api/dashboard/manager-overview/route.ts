import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';
import { PastMonthComparisonData, FixedBillItem, ManagerOverviewData } from '@/src/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
}

function getMonthStart(date: Date): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

function getMonthEnd(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d.toISOString().split('T')[0];
}

function getDateRange(startDate: string, endDate: string): string[] {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.toISOString().slice(0, 7);

    const baseRate = db.settings?.mealRate || 45;

    const allMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);
    const totalBazaarExpenses = db.bazaarExpenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.totalCost, 0);

    const liveMealRate = allMealsCount > 0 && totalBazaarExpenses > 0
      ? Math.round((totalBazaarExpenses / allMealsCount) * 100) / 100
      : baseRate;

    const activeMembers = db.users.filter(u => u.role === 'member' && u.status === 'approved');
    const memberCount = Math.max(activeMembers.length, 1);

    // Mess total meal today
    const messTotalMealsToday = db.records
      .filter(r => r.date === todayStr)
      .reduce((sum, r) => sum + r.count, 0);

    // Mess total meal of current month
    const messTotalMealsMonth = db.records
      .filter(r => r.date && r.date.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.count, 0);

    // Meal total cost of this week
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(weekStart);
    const weekMeals = db.records
      .filter(r => r.date && r.date >= weekStart && r.date <= weekEnd)
      .reduce((sum, r) => sum + r.count, 0);
    const mealCostThisWeek = Math.round(weekMeals * liveMealRate * 100) / 100;

    // Meal total cost of current month
    const monthMeals = db.records
      .filter(r => r.date && r.date.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.count, 0);
    const mealCostThisMonth = Math.round(monthMeals * liveMealRate * 100) / 100;

    // Fixed bills
    const currentBills = db.sharedBills.filter(b => b.month === currentMonth);
    const fixedBills: FixedBillItem[] = currentBills.map(bill => {
      const memberShare = Math.round(bill.totalAmount / memberCount);
      const payments = db.memberBillPayments.filter(
        p => p.month === currentMonth && p.type === bill.type
      );
      const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const paidCount = payments.length;
      const isFullyPaid = paidAmount >= bill.totalAmount && bill.totalAmount > 0;
      const isPartiallyPaid = paidAmount > 0 && !isFullyPaid;

      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (isFullyPaid) status = 'paid';
      else if (isPartiallyPaid) status = 'partial';

      return {
        type: bill.type,
        label: bill.label,
        totalAmount: bill.totalAmount,
        memberShare,
        paidAmount,
        paidCount,
        memberCount,
        status,
        dueDate: bill.dueDate || `${currentMonth}-10`,
      };
    });

    // Past month comparison data (last 6 months)
    const pastMonthComparison: PastMonthComparisonData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

      const monthRecords = db.records.filter(r => r.date && r.date.startsWith(monthKey));
      const monthMeals = monthRecords.reduce((sum, r) => sum + r.count, 0);
      const monthMealCost = Math.round(monthMeals * liveMealRate * 100) / 100;

      const monthBills = db.sharedBills.filter(b => b.month === monthKey);
      const monthFixedCost = monthBills.reduce((sum, b) => sum + b.totalAmount, 0);

      pastMonthComparison.push({
        month: monthKey,
        label: monthLabel,
        messMeals: monthMeals,
        mealCost: monthMealCost,
        fixedCost: monthFixedCost,
        totalCost: Math.round((monthMealCost + monthFixedCost) * 100) / 100,
      });
    }

    const responseData: ManagerOverviewData = {
      messTotalMealsToday,
      messTotalMealsMonth,
      mealCostThisWeek,
      mealCostThisMonth,
      liveMealRate,
      today: todayStr,
      fixedBills,
      pastMonthComparison,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Manager overview fetch error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}