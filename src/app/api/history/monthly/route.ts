import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';
import { MonthlyHistoryRecord, MessMonthlyHistoryRecord } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    const userId = user!.id;

    // Collect list of months from db.monthlySummaries, records, deposits, bazaarExpenses
    const monthsSet = new Set<string>();

    db.monthlySummaries.forEach(s => monthsSet.add(s.month));
    db.records.forEach(r => {
      if (r.date) monthsSet.add(r.date.slice(0, 7));
    });
    db.deposits.forEach(d => {
      if (d.date) monthsSet.add(d.date.slice(0, 7));
    });
    db.bazaarExpenses.forEach(b => {
      if (b.date) monthsSet.add(b.date.slice(0, 7));
    });

    // Ensure current month is included
    const currentMonth = new Date().toISOString().slice(0, 7);
    monthsSet.add(currentMonth);

    const sortedMonths = Array.from(monthsSet).sort().reverse();

    const approvedMembers = db.users.filter(u => u.status === 'approved');
    const memberCount = Math.max(approvedMembers.length, 1);

    const individualHistory: MonthlyHistoryRecord[] = [];
    const messHistory: MessMonthlyHistoryRecord[] = [];

    for (const month of sortedMonths) {
      const dateObj = new Date(`${month}-01T00:00:00`);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Check if archived in monthlySummaries
      const summary = db.monthlySummaries.find(s => s.month === month);

      // Total Mess Fixed Cost
      const messBills = db.sharedBills.filter(b => b.month === month);
      const totalMessFixedCost = messBills.reduce((sum, b) => sum + b.totalAmount, 0);

      // Total Mess Bazaar / Meal Cost
      const messBazaar = db.bazaarExpenses
        .filter(e => e.status === 'approved' && e.date.startsWith(month))
        .reduce((sum, e) => sum + e.totalCost, 0);

      const messMeals = db.records
        .filter(r => r.date.startsWith(month))
        .reduce((sum, r) => sum + (r.count || 0), 0);

      const messMealRate = summary?.finalMealRate || (messMeals > 0 ? messBazaar / messMeals : db.settings.mealRate || 45);

      // User Individual Data
      const userPayments = db.memberBillPayments.filter(p => p.userId === userId && p.month === month);
      const userFixedPaid = userPayments.reduce((sum, p) => sum + p.amount, 0);

      const userRecords = db.records.filter(r => r.userId === userId && r.date.startsWith(month));
      const userMealCount = userRecords.reduce((sum, r) => sum + (r.count || 0), 0);
      const userMealCost = Math.round(userMealCount * messMealRate);

      const isCurrent = month === currentMonth;

      individualHistory.push({
        month,
        monthName,
        fixedCost: userFixedPaid,
        mealCost: userMealCost,
        totalCost: userFixedPaid + userMealCost,
        status: summary ? 'settled' : (isCurrent ? 'in_progress' : 'pending'),
      });

      messHistory.push({
        month,
        monthName,
        totalFixedCost: totalMessFixedCost,
        totalMealCost: messBazaar,
        totalMessCost: totalMessFixedCost + messBazaar,
        status: summary ? 'settled' : (isCurrent ? 'in_progress' : 'pending'),
      });
    }

    return NextResponse.json({
      individualHistory,
      messHistory,
    });
  } catch (error) {
    console.error('Fetch history error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
