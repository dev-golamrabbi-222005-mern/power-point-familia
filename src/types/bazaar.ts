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
  member2Id?: string; // Second assigned member for double member bajar duty
  date: string; // YYYY-MM-DD
  shoppingList: string[]; // Items the manager requests
  budget?: number; // Manager assigned budget for the bajar
  status: 'pending' | 'submitted' | 'verified' | 'skipped';
  submittedAt?: string;
  submittedBy?: string; // userId of member who submitted the actual cost
  delegatedFrom?: string; // userId of the person who delegated this to someone else
  bazaarPairId?: string; // Links to a BazaarPair
  userName?: string; // Hydrated Member 1
  member2Name?: string; // Hydrated Member 2
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

export interface BazaarActivityDetail {
  userId: string;
  userName: string;
  totalCost: number;
  items: string;
  status: string;
}

export interface BazaarDutyInfo {
  hasDuty: boolean;
  date: string;
  pairPartnerName?: string;
  shoppingList?: string[];
  budget?: number;
  assignmentId?: string;
  status?: string;
  submittedDetails?: {
    submittedByName?: string;
    totalCost?: number;
    items?: { name: string; cost: number }[];
    submittedAt?: string;
  };
}
