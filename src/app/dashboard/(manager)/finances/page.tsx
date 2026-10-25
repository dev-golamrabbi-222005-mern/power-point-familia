'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import ManagerFinanceTab from '@/src/components/dashboard/(manager)/ManagerFinanceTab';

export default function ManagerFinancesPage() {
  const router = useRouter();
  const { token } = useAuth();

  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Global Member Finances & Fixed Costs</h2>
      <ManagerFinanceTab
        token={token}
        onNavigateToTickets={(targetUserId) => {
          if (targetUserId) {
            router.push(`/dashboard/tickets?user=${encodeURIComponent(targetUserId)}`);
          } else {
            router.push('/dashboard/tickets');
          }
        }}
      />
    </div>
  );
}
