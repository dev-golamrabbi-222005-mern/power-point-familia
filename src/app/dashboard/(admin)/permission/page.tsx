'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useDashboard } from '@/src/context/DashboardContext';
import AdminPermissionsTab from '@/src/components/dashboard/(admin)/AdminPermissionsTab';

export default function AdminPermissionPage() {
  const { token } = useAuth();
  const { mealRate, refreshSystemData } = useDashboard();

  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">RBAC Permissions & Access Matrix</h2>
      <AdminPermissionsTab
        token={token}
        mealRate={mealRate}
        onRefreshSettings={refreshSystemData}
      />
    </div>
  );
}
