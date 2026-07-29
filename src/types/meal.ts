export interface MealMenu {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'lunch' | 'dinner';
  items: string[];
  estimatedCost: number;
}

export interface MealRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'lunch' | 'dinner';
  count: number; // e.g. 0, 1, 2, etc.
}

export interface MealCostData {
  date: string;
  dayLabel?: string;
  week?: string;
  myMealCost: number;
  myLivingCost: number;
  myTotalCost: number;
  messMealCost: number;
  messLivingCost: number;
  messTotalCost: number;
}

export interface MealCostAggregates {
  myMealCost: number;
  myLivingCost: number;
  myTotalCost: number;
  messMealCost: number;
  messLivingCost: number;
  messTotalCost: number;
}

export interface MealCostsBreakdownResponse {
  weekly: {
    data: MealCostData[];
    aggregates: MealCostAggregates;
    dateRange: { start: string; end: string };
  };
  monthly: {
    data: MealCostData[];
    aggregates: MealCostAggregates;
    dateRange: { start: string; end: string };
  };
}

export interface MealSummary {
  totalMeals: number;
  lunch: number;
  dinner: number;
}

export interface MealToggleLog {
  id: string;
  userId: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  action: 'on' | 'off';
  oldCount: number;
  newCount: number;
  timestamp: string;
}
