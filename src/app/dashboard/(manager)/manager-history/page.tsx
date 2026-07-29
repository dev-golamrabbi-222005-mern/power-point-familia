'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import ManagerHistoryTab from '@/src/components/dashboard/(manager)/ManagerHistoryTab';

export default function ManagerHistoryPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Manager Monthly History Records</h2>
      <ManagerHistoryTab token={token} />
    </div>
  );
}
