'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useDashboard } from '@/src/context/DashboardContext';
import AdminUserDirectoryTab from '@/src/components/dashboard/(admin)/AdminUserDirectoryTab';

export default function AdminUsersPage() {
  const { user, token } = useAuth();
  const { allUsers, loadingUsers, refreshUsers } = useDashboard();

  if (!user || !token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">User Role Assignment & Directory</h2>
      <AdminUserDirectoryTab
        currentUser={user}
        token={token}
        allUsers={allUsers}
        loadingUsers={loadingUsers}
        onRefreshData={refreshUsers}
      />
    </div>
  );
}
