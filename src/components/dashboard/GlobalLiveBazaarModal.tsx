'use client';

import React from 'react';
import { useDashboard } from '@/src/context/DashboardContext';
import LiveBazaarModal from './LiveBazaarModal';
import { showErrorAlert } from '@/src/lib/alerts';

export default function GlobalLiveBazaarModal() {
  const { 
    token, 
    todayBazaarAssignment, 
    isLiveBazaarOpen, 
    setIsLiveBazaarOpen, 
    refreshAll 
  } = useDashboard();

  if (!isLiveBazaarOpen || !todayBazaarAssignment || !token) {
    return null;
  }

  return (
    <LiveBazaarModal
      isOpen={isLiveBazaarOpen}
      onClose={() => setIsLiveBazaarOpen(false)}
      assignment={todayBazaarAssignment}
      token={token}
      onSuccess={() => {
        refreshAll();
      }}
      onError={(err) => {
        showErrorAlert('Bazaar Error', err);
      }}
    />
  );
}
