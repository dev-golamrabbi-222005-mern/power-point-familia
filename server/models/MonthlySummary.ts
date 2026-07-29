export interface MonthlySummaryModel {
  id: string;
  month: string;
  totalBazaarExpense: number;
  totalMealsCount: number;
  finalMealRate: number;
  memberSummaries: {
    userId: string;
    userName: string;
    userEmail: string;
    totalMeals: number;
    mealCost: number;
    totalDeposits: number;
    endingBalance: number;
    carryForwardToNextMonth: number;
  }[];
  status: 'pending_approval' | 'archived';
  initiatedBy: string;
  initiatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}
