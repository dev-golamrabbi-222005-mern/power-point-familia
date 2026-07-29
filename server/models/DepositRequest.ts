export interface DepositRequestModel {
  id: string;
  userId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  type?: 'meal_cash' | 'utility' | 'weekly_payment' | 'refund' | 'other';
  remarks?: string;
}
