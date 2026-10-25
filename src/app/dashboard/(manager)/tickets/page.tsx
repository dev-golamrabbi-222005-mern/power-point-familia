'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useDashboard } from '@/src/context/DashboardContext';
import ManagerTicketsTab from '@/src/components/dashboard/(manager)/ManagerTicketsTab';

function TicketsContent() {
  const { token } = useAuth();
  const { refreshDeposits } = useDashboard();
  const searchParams = useSearchParams();
  const prefillUser = searchParams?.get('user') || null;

  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Deposit Requests & Warning Tickets</h2>
      <ManagerTicketsTab
        token={token}
        prefillWarnUserId={prefillUser}
        onRefreshData={refreshDeposits}
      />
    </div>
  );
}

export default function ManagerTicketsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-zinc-500 py-4">Loading tickets view...</div>}>
      <TicketsContent />
    </Suspense>
  );
}
