export type UserRole = 'user' | 'member' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

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

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  userName?: string; // Hydrated for manager/admin display
}

export interface SystemSettings {
  mealRate: number; // Rate per meal unit, e.g. 45
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface DashboardStats {
  userStats: {
    totalBalance: number;
    totalDeposits: number;
    totalMealsCount: number;
    totalMealCost: number;
    pendingDeposits: number;
  };
  managerStats?: {
    totalSystemBalance: number;
    totalSystemDeposits: number;
    totalSystemMealsCount: number;
    totalSystemMealCost: number;
    pendingDepositsCount: number;
    membersCount: number;
    activeMenuCount: number;
  };
}
