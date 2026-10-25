import { DatabaseSchema } from '../config/db';

/**
 * Calculates the LIVE actual meal rate based solely on approved bazaar expenses divided by total meals.
 * Returns 0 if no meals or no approved bazaar expenses have been recorded yet.
 */
export function calculateLiveMealRate(dbData: DatabaseSchema): number {
  const verifiedExpenses = (dbData.bazaarExpenses || []).filter(
    (e) => e.status === 'approved' || (e.status as string) === 'verified'
  );
  const totalVerifiedMealCost = verifiedExpenses.reduce((sum, e) => sum + (e.totalCost || 0), 0);

  const totalMealsCount = (dbData.records || []).reduce((sum, r) => sum + (r.count || 0), 0);

  if (totalMealsCount === 0 || totalVerifiedMealCost === 0) {
    return 0;
  }

  const liveRate = Math.round((totalVerifiedMealCost / totalMealsCount) * 100) / 100;
  return liveRate;
}

/**
 * Returns the estimated baseline budget rate configured in settings (default: 45).
 */
export function getBaseMealRate(dbData: DatabaseSchema): number {
  return dbData.settings?.mealRate || 45;
}
