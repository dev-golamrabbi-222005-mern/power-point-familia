'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import AdminUserDirectoryTab from '@/src/components/dashboard/(admin)/AdminUserDirectoryTab';

export default function AdminUsersPage() {
  const { user, token } = useAuth();
  if (!user || !token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">User Role Assignment & Directory</h2>
      <AdminUserDirectoryTab currentUser={user} token={token} allUsers={[]} loadingUsers={false} onRefreshData={() => {}} />
    </div>
  );
}
