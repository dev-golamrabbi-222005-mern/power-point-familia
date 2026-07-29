export interface DailyExpenseModel {
  id: string;
  assignmentId: string;
  userId: string;
  date: string;
  items: { name: string; cost: number }[];
  totalCost: number;
  receiptImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
