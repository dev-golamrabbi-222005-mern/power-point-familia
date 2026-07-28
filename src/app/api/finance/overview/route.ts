import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/src/lib/auth';
import { getDb, ensureDbInit } from '@/src/lib/db';
import { FixedExpenseItem, FinanceOverviewData, FixedUtilityType } from '@/src/types';

export async function GET(req: NextRequest) {
  try {
    const { error, user } = authenticate(req);
    if (error) return error;

    await ensureDbInit();
    const db = getDb();

    const userId = user!.id;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // 1. Calculate Approved Meal Cash Added this month by the user
    const memberApprovedDeposits = db.deposits.filter(
      d => d.userId === userId && d.status === 'approved' && d.date.startsWith(currentMonth)
    );
    const mealCashAdded = memberApprovedDeposits.reduce((sum, d) => sum + d.amount, 0);

    // 2. Fixed Expenses (Rent, Electricity, WiFi, Gas, Servant Fee)
    const approvedMembers = db.users.filter(u => u.status === 'approved');
    const memberCount = Math.max(approvedMembers.length, 1);

    const utilityTypes: { type: FixedUtilityType; label: string }[] = [
      { type: 'rent', label: 'Basha Vara (Rent)' },
      { type: 'electricity', label: 'Current Bill (Electricity)' },
      { type: 'wifi', label: 'WiFi Bill' },
      { type: 'gas', label: 'Gas Bill' },
      { type: 'servant_fee', label: 'Servant Fee' },
    ];

    const dbUser = db.users.find(u => u.id === userId);
    const assignedFixed = dbUser?.fixedCosts;
    const assignedPastDue = dbUser?.pastMonthDue || 0;

    let totalFixedCostPaid = 0;

    const fixedExpenses: FixedExpenseItem[] = utilityTypes.map(({ type, label }) => {
      // Find shared bill for this month or manager assigned custom fixed share
      const sharedBill = db.sharedBills.find(b => b.month === currentMonth && b.type === type);
      const totalAmount = sharedBill ? sharedBill.totalAmount : 0;
      
      let share = Math.round(totalAmount / memberCount);
      if (assignedFixed) {
        if (type === 'rent' && assignedFixed.rent !== undefined) share = assignedFixed.rent;
        if (type === 'electricity' && assignedFixed.electricity !== undefined) share = assignedFixed.electricity;
        if (type === 'wifi' && assignedFixed.wifi !== undefined) share = assignedFixed.wifi;
        if (type === 'gas' && assignedFixed.gas !== undefined) share = assignedFixed.gas;
        if (type === 'servant_fee' && assignedFixed.servant !== undefined) share = assignedFixed.servant;
      }

      // Find user payment for this bill
      const payment = db.memberBillPayments.find(
        p => p.userId === userId && p.month === currentMonth && p.type === type
      );
      const paid = payment ? payment.amount : 0;
      const isPaid = paid >= share && share > 0;

      if (isPaid) {
        totalFixedCostPaid += paid;
      }

      return {
        type,
        label,
        share,
        paid,
        status: isPaid ? 'paid' : 'pending',
        dueDate: sharedBill?.dueDate || `${currentMonth}-10`,
        paymentId: payment?.id,
      };
    });

    // 3. Actual Meal Cost Calculation
    const userRecords = db.records.filter(r => r.userId === userId && r.date.startsWith(currentMonth));
    const myTotalMeals = userRecords.reduce((sum, r) => sum + (r.count || 0), 0);

    // Calculate total mess expenses and meals for live meal rate
    const totalMessBazaar = db.bazaarExpenses
      .filter(e => e.status === 'approved' && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.totalCost, 0);

    const totalMessMeals = db.records
      .filter(r => r.date.startsWith(currentMonth))
      .reduce((sum, r) => sum + (r.count || 0), 0);

    const liveMealRate = totalMessMeals > 0 
      ? Math.round((totalMessBazaar / totalMessMeals) * 100) / 100 
      : db.settings.mealRate || 45;

    const actualMealCost = Math.round(myTotalMeals * liveMealRate);
    const actualTotalCost = totalFixedCostPaid + actualMealCost;

    // 4. Finance Visibility check (Manager 1-hour window or last day of month)
    const todayObj = new Date();
    const lastDayOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0).getDate();
    const isLastDay = todayObj.getDate() === lastDayOfMonth;

    const visibilityUntil = db.settings.financeVisibilityUntil 
      ? new Date(db.settings.financeVisibilityUntil)
      : null;

    const isWindowActive = visibilityUntil ? visibilityUntil > new Date() : false;
    const isCalculationVisible = isLastDay || isWindowActive;

    // 5. Weekly Meal Cash Guidance
    const currentDay = todayObj.getDate();
    const currentWeekNumber = Math.min(Math.ceil(currentDay / 7), 4);
    const suggestedAmount = currentWeekNumber === 1 ? 1000 : 500;

    const totalAssignedFixed = fixedExpenses.reduce((sum, f) => sum + f.share, 0);

    const responseData: FinanceOverviewData = {
      currentMonthName,
      fixedCostPaid: totalFixedCostPaid,
      totalAssignedFixed,
      mealCashAdded,
      estimatedTotalCost: totalFixedCostPaid + mealCashAdded,
      fixedExpenses,
      myTotalMeals,
      liveMealRate,
      actualMealCost,
      actualTotalCost,
      assignedPastDue,
      isCalculationVisible,
      financeVisibilityUntil: db.settings.financeVisibilityUntil,
      weeklyMealCashGuidance: {
        currentWeekNumber,
        suggestedAmount,
        totalMonthTarget: 2500,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Fetch finance overview error', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
