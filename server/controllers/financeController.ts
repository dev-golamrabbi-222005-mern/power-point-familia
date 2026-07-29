import { getDb, saveDb } from '../config/db';
import { calculateLiveMealRate } from '../utils/calculateMealRate';

export async function getMemberFinanceOverview(userId: string) {
  const dbData = await getDb();
  const user = dbData.users.find((u) => u.id === userId);

  const fixedCostPaid = (dbData.deposits || [])
    .filter((d) => d.userId === userId && d.type === 'utility' && d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const mealCashAdded = (dbData.deposits || [])
    .filter((d) => d.userId === userId && (d.type === 'meal_cash' || d.type === 'weekly_payment') && d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalAssignedFixed = user?.fixedCosts?.customFixedTotal || 0;
  const myRecords = dbData.records.filter((r) => r.userId === userId);
  const myTotalMeals = myRecords.reduce((sum, r) => sum + (r.count || 0), 0);
  const liveRate = calculateLiveMealRate(dbData);
  const actualMealCost = Math.round(myTotalMeals * liveRate);

  return {
    status: 200,
    data: {
      currentMonthName: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      fixedCostPaid,
      totalAssignedFixed,
      mealCashAdded,
      estimatedTotalCost: totalAssignedFixed + actualMealCost,
      fixedExpenses: [
        { type: 'rent', label: 'Seat Rent', share: user?.fixedCosts?.rent || 0, paid: fixedCostPaid, status: 'pending' },
        { type: 'electricity', label: 'Electricity Bill', share: user?.fixedCosts?.electricity || 0, paid: 0, status: 'pending' },
        { type: 'wifi', label: 'WiFi & Internet', share: user?.fixedCosts?.wifi || 0, paid: 0, status: 'pending' },
        { type: 'gas', label: 'Gas & Utility', share: user?.fixedCosts?.gas || 0, paid: 0, status: 'pending' },
        { type: 'servant_fee', label: 'Cook / Servant', share: user?.fixedCosts?.servant || 0, paid: 0, status: 'pending' },
      ],
      myTotalMeals,
      liveMealRate: liveRate,
      actualMealCost,
      actualTotalCost: totalAssignedFixed + actualMealCost,
      assignedPastDue: user?.pastMonthDue || 0,
      isCalculationVisible: true,
      weeklyMealCashGuidance: {
        currentWeekNumber: 1,
        suggestedAmount: 1000,
        totalMonthTarget: 2500,
      },
    },
  };
}

export async function assignFixedCostsAndDue(body: { targetUserId?: string; fixedCosts?: { rent?: number; electricity?: number; wifi?: number; gas?: number; servant?: number; customFixedTotal?: number }; pastMonthDue?: number }) {
  const { targetUserId, fixedCosts, pastMonthDue } = body;
  if (!targetUserId) {
    return { status: 400, data: { message: 'Target user ID is required.' } };
  }

  const dbData = await getDb();
  const targetUser = dbData.users.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return { status: 404, data: { message: 'Member not found.' } };
  }

  if (fixedCosts !== undefined) {
    targetUser.fixedCosts = {
      rent: Number(fixedCosts.rent) || 0,
      electricity: Number(fixedCosts.electricity) || 0,
      wifi: Number(fixedCosts.wifi) || 0,
      gas: Number(fixedCosts.gas) || 0,
      servant: Number(fixedCosts.servant) || 0,
      customFixedTotal: Number(fixedCosts.customFixedTotal) || 0,
    };
  }

  if (pastMonthDue !== undefined) {
    targetUser.pastMonthDue = Number(pastMonthDue) || 0;
  }

  await saveDb(dbData);
  return { status: 200, data: { message: 'Fixed costs and due assigned successfully.', user: targetUser } };
}
