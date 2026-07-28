'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import DashboardLayout from '@/src/components/DashboardLayout';
import ManagerDashboard from '@/src/components/ManagerDashboard';
import { MealMenu } from '@/src/types';

export default function ManagerDashboardPage() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [mealRate, setMealRate] = useState<number>(45);

  const fetchSystemData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const menuRes = await fetch('/api/menu', { headers });
      if (menuRes.ok) setMenus(await menuRes.json());

      const settingsRes = await fetch('/api/settings', { headers });
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setMealRate(sData.mealRate || 45);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user || !token) {
        router.push('/login');
      } else if (user.role !== 'manager' && user.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchSystemData();
      }
    }
  }, [user, token, loading]);

  if (loading || !user || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Manager Dashboard...</p>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} token={token} onLogout={logout}>
      <ManagerDashboard
        user={user}
        token={token}
        menus={menus}
        mealRate={mealRate}
        onRefreshMenus={fetchSystemData}
      />
    </DashboardLayout>
  );
}
