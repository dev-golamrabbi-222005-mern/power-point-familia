export type UserRole = 'user' | 'member' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  bazaarCount: number; // Tracks how many bazaar duties this user has done
  autoBookDisabled?: boolean; // Member-level opt-out from auto-booking
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
  userEmail?: string;
}

export interface BazaarPair {
  id: string;
  member1Id: string;
  member2Id: string;
  isActive: boolean; // Whether this pair is in the rotation
  createdAt: string;
  member1Name?: string; // Hydrated
  member2Name?: string; // Hydrated
}

export interface BazaarAssignment {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  shoppingList: string[]; // Items the manager requests
  status: 'pending' | 'submitted' | 'verified' | 'skipped';
  submittedAt?: string;
  delegatedFrom?: string; // userId of the person who delegated this to someone else
  bazaarPairId?: string; // Links to a BazaarPair
  userName?: string; // Hydrated
}

export interface BazaarExpense {
  id: string;
  assignmentId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  items: { name: string; cost: number }[];
  totalCost: number;
  receiptImage?: string; // Optional base64 or URL
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  submittedAt: string;
  userName?: string; // Hydrated
}

export interface WeeklyPayment {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  expectedAmount: number; // 500 normal, 1000 first week
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  depositId?: string; // Link to deposit if paid via system
  userName?: string; // Hydrated
}

export interface SharedBill {
  id: string;
  month: string; // YYYY-MM
  type: 'rent' | 'electricity' | 'wifi' | 'servant_fee';
  label: string; // Display name
  totalAmount: number; // Total bill for all members
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface MemberBillPayment {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  type: 'rent' | 'electricity' | 'wifi' | 'servant_fee';
  amount: number;
  paidAt: string;
  depositId?: string; // Link to deposit if applicable
  userName?: string; // Hydrated
}

export interface RefundRequest {
  id: string;
  userId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  reason: string;
  paymentMethod: string; // How they want the money back (bKash, Nagad, Cash, etc.)
  mobileNumber?: string; // For mobile banking refunds
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string; // Admin/manager who processed
  remarks?: string; // Admin/manager notes
  userName?: string; // Hydrated
  userEmail?: string; // Hydrated
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SystemSettings {
  mealRate: number; // Rate per meal unit (dynamic fallback)
  weeklyPayment: number; // 500 default
  initialWeekPayment: number; // 1000 for first week
  monthlyFlatRate: number; // 2500 for full month flat
  startWeekDate: string; // Start of weekly cycle YYYY-MM-DD
  autoBookMeals: boolean; // Auto-book all members for published menus
  currentPairIndex: number; // Index tracking which BazaarPair is up next
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
    liveMealRate: number;
    weeklyPaymentStatus: WeeklyPayment | null;
    utilities: {
      rent: { share: number; paid: number; percentage: number };
      electricity: { share: number; paid: number; percentage: number };
      wifi: { share: number; paid: number; percentage: number };
      servantFee: { share: number; paid: number; percentage: number };
      totalShare: number;
      totalPaid: number;
      overallPercentage: number;
    };
  };
  managerStats?: {
    totalSystemBalance: number;
    totalSystemDeposits: number;
    totalSystemMealsCount: number;
    totalSystemMealCost: number;
    liveMealRate: number;
    pendingDepositsCount: number;
    membersCount: number;
    activeMenuCount: number;
    totalBazaarExpenses: number;
    pendingBazaarCount: number;
    deficitMembers: { userId: string; name: string; balance: number }[];
    autoBookEnabled: boolean;
    bazaarRotationOrder: { userId: string; name: string; bazaarCount: number }[];
    weekBazaarCount: number; // How many bazaars scheduled this week
  };
}
