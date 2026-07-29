export interface UserModel {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'member' | 'manager' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  passwordHash?: string;
  bazaarCount: number;
  autoBookDisabled?: boolean;
  previousMonthCarryForward?: number;
  pastMonthDue?: number;
  fixedCosts?: {
    rent?: number;
    electricity?: number;
    wifi?: number;
    gas?: number;
    servant?: number;
    customFixedTotal?: number;
  };
  pushSubscriptions?: any[];
}
