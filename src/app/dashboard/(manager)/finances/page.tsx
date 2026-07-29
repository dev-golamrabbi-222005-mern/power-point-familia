'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import ManagerFinanceTab from '@/src/components/dashboard/(manager)/ManagerFinanceTab';

export default function ManagerFinancesPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Global Member Finances & Fixed Costs</h2>
      <ManagerFinanceTab token={token} onNavigateToTickets={() => {}} />
    </div>
  );
}
