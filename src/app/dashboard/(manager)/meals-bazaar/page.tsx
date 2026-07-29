'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import ManagerMealsTab from '@/src/components/dashboard/(manager)/ManagerMealsTab';

export default function ManagerMealsBazaarPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Meals Menu & Bazaar Verification</h2>
      <ManagerMealsTab token={token} menus={[]} onRefreshMenus={() => {}} />
    </div>
  );
}
