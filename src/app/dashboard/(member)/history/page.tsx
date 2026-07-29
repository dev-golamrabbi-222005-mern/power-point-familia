'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import HistoryTab from '@/src/components/dashboard/(member)/HistoryTab';

export default function MemberHistoryPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Personal History & Monthly Records</h2>
      <HistoryTab token={token} />
    </div>
  );
}
