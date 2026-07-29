import { getDb, saveDb } from '../config/db';

export async function assignBazaarDuty(body: { userId?: string; member2Id?: string; date?: string; shoppingList?: string[]; budget?: number }) {
  const { userId, member2Id, date, shoppingList, budget } = body;
  if (!userId || !date) {
    return { status: 400, data: { message: 'Primary member and date are required.' } };
  }

  const dbData = await getDb();
  let assignment = dbData.bazaarAssignments.find((a) => a.date === date);

  if (assignment) {
    assignment.userId = userId;
    if (member2Id !== undefined) assignment.member2Id = member2Id;
    if (shoppingList !== undefined) assignment.shoppingList = shoppingList;
    if (budget !== undefined) assignment.budget = budget;
    assignment.status = 'pending';
  } else {
    assignment = {
      id: 'baz_' + Date.now(),
      userId,
      member2Id,
      date,
      shoppingList: shoppingList || [],
      budget,
      status: 'pending',
    };
    dbData.bazaarAssignments.push(assignment);
  }

  await saveDb(dbData);
  return { status: 200, data: { message: 'Bazaar duty assigned successfully.', assignment } };
}

export async function submitBazaarExpense(userId: string, body: { assignmentId?: string; date?: string; items?: { name: string; cost: number }[]; totalCost?: number; receiptImage?: string }) {
  const { assignmentId, date, items, totalCost, receiptImage } = body;
  if (!date || !items || totalCost === undefined) {
    return { status: 400, data: { message: 'Date, items, and total cost are required.' } };
  }

  const dbData = await getDb();
  let assignment = assignmentId
    ? dbData.bazaarAssignments.find((a) => a.id === assignmentId)
    : dbData.bazaarAssignments.find((a) => a.date === date && (a.userId === userId || a.member2Id === userId));

  if (assignment) {
    assignment.status = 'submitted';
    assignment.submittedAt = new Date().toISOString();
    assignment.submittedBy = userId;
  }

  const expense = {
    id: 'exp_' + Date.now(),
    assignmentId: assignment?.id || 'manual_' + Date.now(),
    userId,
    date,
    items,
    totalCost,
    receiptImage,
    status: 'pending' as const,
    submittedAt: new Date().toISOString(),
  };

  dbData.bazaarExpenses.push(expense);
  await saveDb(dbData);

  return { status: 200, data: { message: 'Bazaar expense submitted for verification.', expense } };
}
