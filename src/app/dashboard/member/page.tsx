'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import DashboardLayout from '@/src/components/DashboardLayout';
import MemberDashboard from '@/src/components/MemberDashboard';

export default function MemberDashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !token) {
        router.push('/login');
      }
    }
  }, [user, token, loading, router]);

  if (loading || !user || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Member Dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} token={token} onLogout={logout}>
      <MemberDashboard
        user={user}
        token={token}
      />
    </DashboardLayout>
  );
}
