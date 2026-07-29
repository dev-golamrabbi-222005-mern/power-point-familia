import { getDb, saveDb } from '../config/db';
import { calculateLiveMealRate } from '../utils/calculateMealRate';

export async function getMealOverview(userId: string) {
  const dbData = await getDb();
  const todayStr = new Date().toISOString().split('T')[0];

  const myRecords = dbData.records.filter((r) => r.userId === userId);
  const myTotalMeals = myRecords.reduce((sum, r) => sum + (r.count || 0), 0);

  const todayMyLunch = myRecords
    .filter((r) => r.date === todayStr && r.mealType === 'lunch')
    .reduce((sum, r) => sum + (r.count || 0), 0);
  const todayMyDinner = myRecords
    .filter((r) => r.date === todayStr && r.mealType === 'dinner')
    .reduce((sum, r) => sum + (r.count || 0), 0);

  const messTotalMeals = dbData.records.reduce((sum, r) => sum + (r.count || 0), 0);
  const todayMessLunch = dbData.records
    .filter((r) => r.date === todayStr && r.mealType === 'lunch')
    .reduce((sum, r) => sum + (r.count || 0), 0);
  const todayMessDinner = dbData.records
    .filter((r) => r.date === todayStr && r.mealType === 'dinner')
    .reduce((sum, r) => sum + (r.count || 0), 0);

  const liveRate = calculateLiveMealRate(dbData);

  return {
    status: 200,
    data: {
      myTotalMeals,
      todayMyMeals: todayMyLunch + todayMyDinner,
      todayMyLunch,
      todayMyDinner,
      messTotalMeals,
      todayMessMeals: todayMessLunch + todayMessDinner,
      todayMessLunch,
      todayMessDinner,
      liveMealRate: liveRate,
      today: todayStr,
    },
  };
}

export async function toggleMeal(userId: string, body: { date: string; mealType: 'lunch' | 'dinner'; count: number }) {
  const { date, mealType, count } = body;
  if (!date || !mealType || count === undefined) {
    return { status: 400, data: { message: 'Missing required parameters.' } };
  }

  const dbData = await getDb();
  let record = dbData.records.find(
    (r) => r.userId === userId && r.date === date && r.mealType === mealType
  );

  const oldCount = record ? record.count : 0;
  if (record) {
    record.count = count;
  } else {
    record = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId,
      date,
      mealType,
      count,
    };
    dbData.records.push(record);
  }

  if (!dbData.mealToggleLog) dbData.mealToggleLog = [];
  dbData.mealToggleLog.push({
    id: 'log_' + Date.now(),
    userId,
    date,
    mealType,
    action: count > oldCount ? 'on' : 'off',
    oldCount,
    newCount: count,
    timestamp: new Date().toISOString(),
  });

  await saveDb(dbData);

  return { status: 200, data: { message: 'Meal booking updated successfully.', record } };
}
