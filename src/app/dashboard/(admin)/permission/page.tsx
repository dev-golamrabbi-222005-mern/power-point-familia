'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import AdminPermissionsTab from '@/src/components/dashboard/(admin)/AdminPermissionsTab';

export default function AdminPermissionPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">RBAC Permissions & Access Matrix</h2>
      <AdminPermissionsTab token={token} mealRate={45} onRefreshSettings={() => {}} />
    </div>
  );
}
