export interface DailyMealModel {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'lunch' | 'dinner';
  count: number;
}
