import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, saveDb, ensureDbInit } from '@/src/lib/db';
import { MonthlySummary } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();
    return NextResponse.json(db.monthlySummaries || []);
  } catch (err) {
    console.error('Fetch month-end summaries error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// Manager initiates Month-End Reset request
export async function POST(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['manager', 'admin']);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    // Check if there is already a pending reset request
    const existingPending = (db.monthlySummaries || []).find(s => s.status === 'pending_approval');
    if (existingPending) {
      return NextResponse.json(
        { message: 'A month-end reset request is already pending Admin approval.', summary: existingPending },
        { status: 400 }
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Calculate Total Bazaar Expenses
    const approvedExpenses = db.bazaarExpenses.filter(e => e.status === 'approved');
    const totalBazaarExpense = approvedExpenses.reduce((sum, e) => sum + e.totalCost, 0);

    // 2. Calculate Total Consumed Meals
    const totalMealsCount = db.records.reduce((sum, r) => sum + r.count, 0);

    // 3. Live Final Meal Rate
    const finalMealRate = totalMealsCount > 0
      ? totalBazaarExpense / totalMealsCount
      : (db.settings?.mealRate || 45);

    // 4. Calculate individual member summaries & carry forwards
    const approvedMembers = db.users.filter(u => u.status === 'approved');
    const memberSummaries = approvedMembers.map(m => {
      const userMeals = db.records.filter(r => r.userId === m.id).reduce((sum, r) => sum + r.count, 0);
      const mealCost = userMeals * finalMealRate;

      const userDeposits = db.deposits
        .filter(d => d.userId === m.id && d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

      const carryForwardIn = m.previousMonthCarryForward || 0;
      const totalAvailableFund = carryForwardIn + userDeposits;
      const endingBalance = totalAvailableFund - mealCost;

      return {
        userId: m.id,
        userName: m.name,
        userEmail: m.email,
        totalMeals: userMeals,
        mealCost: Number(mealCost.toFixed(2)),
        totalDeposits: userDeposits,
        endingBalance: Number(endingBalance.toFixed(2)),
        carryForwardToNextMonth: Number(endingBalance.toFixed(2)),
      };
    });

    const newSummary: MonthlySummary = {
      id: `summary-${Date.now()}`,
      month: currentMonth,
      totalBazaarExpense,
      totalMealsCount,
      finalMealRate: Number(finalMealRate.toFixed(2)),
      memberSummaries,
      status: 'pending_approval',
      initiatedBy: user!.id,
      initiatedAt: new Date().toISOString(),
    };

    if (!db.monthlySummaries) db.monthlySummaries = [];
    db.monthlySummaries.push(newSummary);
    saveDb(db);

    return NextResponse.json({
      message: 'Month-End Reset request initiated successfully! Sent to Admin for review and approval.',
      summary: newSummary
    }, { status: 201 });
  } catch (err) {
    console.error('Initiate month-end error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// Admin approves & archives Month-End Reset
export async function PUT(req: NextRequest) {
  try {
    const { error, user } = authenticate(req, ['admin']);
    if (error) return error;

    const { summaryId, action } = await req.json(); // action: 'approve' | 'reject'

    await ensureDbInit();
    const db = getDb();

    if (!db.monthlySummaries) db.monthlySummaries = [];
    const summaryIndex = db.monthlySummaries.findIndex(s => s.id === summaryId && s.status === 'pending_approval');

    if (summaryIndex === -1) {
      return NextResponse.json({ message: 'Pending month-end summary request not found.' }, { status: 404 });
    }

    if (action === 'reject') {
      db.monthlySummaries.splice(summaryIndex, 1);
      saveDb(db);
      return NextResponse.json({ message: 'Month-end reset request rejected.' });
    }

    const summary = db.monthlySummaries[summaryIndex];

    // --- CRITICAL DATABASE TRANSACTION ON APPROVAL ---
    // 1. Update user previousMonthCarryForward balances
    summary.memberSummaries.forEach(m => {
      const uIdx = db.users.findIndex(u => u.id === m.userId);
      if (uIdx !== -1) {
        db.users[uIdx].previousMonthCarryForward = m.carryForwardToNextMonth;
      }
    });

    // 2. Archive summary state
    db.monthlySummaries[summaryIndex].status = 'archived';
    db.monthlySummaries[summaryIndex].approvedBy = user!.id;
    db.monthlySummaries[summaryIndex].approvedAt = new Date().toISOString();

    // 3. Clear active DailyMeals (records) and DailyExpenses (bazaarExpenses & assignments)
    db.records = [];
    db.bazaarExpenses = [];
    db.bazaarAssignments = [];
    db.deposits = []; // Reset current month deposits as they are now factored into carry forward

    saveDb(db);

    return NextResponse.json({
      message: 'Month-End Reset approved and archived! All member carry-forward opening balances have been set for the new month.',
      summary: db.monthlySummaries[summaryIndex]
    });
  } catch (err) {
    console.error('Approve month-end error', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
