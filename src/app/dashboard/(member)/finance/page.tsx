'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import FinanceTab from '@/src/components/dashboard/(member)/FinanceTab';

export default function MemberFinancePage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Financial Ledger & Deposits</h2>
      <FinanceTab token={token} />
    </div>
  );
}
