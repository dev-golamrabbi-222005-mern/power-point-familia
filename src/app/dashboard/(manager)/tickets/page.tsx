'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import ManagerTicketsTab from '@/src/components/dashboard/(manager)/ManagerTicketsTab';

export default function ManagerTicketsPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Deposit Requests & Warning Tickets</h2>
      <ManagerTicketsTab token={token} />
    </div>
  );
}
