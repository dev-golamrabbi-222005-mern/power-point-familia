import { DatabaseSchema } from '../config/db';

export function calculateLiveMealRate(dbData: DatabaseSchema): number {
  const verifiedExpenses = (dbData.bazaarExpenses || []).filter(
    (e) => e.status === 'approved' || (e.status as string) === 'verified'
  );
  const totalVerifiedMealCost = verifiedExpenses.reduce((sum, e) => sum + (e.totalCost || 0), 0);

  const totalMealsCount = (dbData.records || []).reduce((sum, r) => sum + (r.count || 0), 0);

  if (totalMealsCount === 0 || totalVerifiedMealCost === 0) {
    return dbData.settings?.mealRate || 45;
  }

  const liveRate = Math.round((totalVerifiedMealCost / totalMealsCount) * 100) / 100;
  return liveRate > 0 ? liveRate : dbData.settings?.mealRate || 45;
}
