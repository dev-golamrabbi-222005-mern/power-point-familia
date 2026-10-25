'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useDashboard } from '@/src/context/DashboardContext';
import MemberDashboard from '@/src/components/MemberDashboard';
import ManagerDashboard from '@/src/components/ManagerDashboard';
import AdminDashboard from '@/src/components/AdminDashboard';
import GuestDashboard from '@/src/components/GuestDashboard';
import { ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const {
    activeRoleView,
    setActiveRoleView,
    menus,
    mealRate,
    refreshSystemData,
    loadingSystem,
  } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !token)) {
      router.push('/login');
    }
  }, [user, token, loading, router]);

  if (loading || (token && loadingSystem && menus.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Loading Dashboard Workspace...
        </p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-zinc-200">Authentication Required</h2>
        <p className="text-xs text-zinc-400">
          Please sign in to access your Power Point Familia dashboard.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // 1. Pending Guests Notice
  if (user.status === 'pending') {
    return (
      <GuestDashboard user={user} token={token} onRefreshUser={() => {}} />
    );
  }

  // 2. Admin Role Dashboard
  if (user.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        token={token}
        mealRate={mealRate}
        onRefreshSettings={refreshSystemData}
      />
    );
  }

  // 3. Manager Role Dashboard (with dual-role view toggle)
  if (user.role === 'manager') {
    return (
      <div className="space-y-6">
        {/* Manager Mode Switch Banner */}
        <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 shadow-xs flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-200">Workspace View Mode</p>
              <p className="text-[10px] text-zinc-400">
                Toggle between Manager controls and personal meal bookings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveRoleView('manager')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRoleView === 'manager'
                  ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Manager Controls
            </button>
            <button
              onClick={() => setActiveRoleView('member')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeRoleView === 'member'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              My Personal Meals
            </button>
          </div>
        </div>

        {activeRoleView === 'manager' ? (
          <ManagerDashboard
            user={user}
            token={token}
            menus={menus}
            mealRate={mealRate}
            onRefreshMenus={refreshSystemData}
          />
        ) : (
          <MemberDashboard
            user={user}
            token={token}
            menus={menus}
            mealRate={mealRate}
            onRefreshStats={refreshSystemData}
          />
        )}
      </div>
    );
  }

  // 4. Standard Approved Member Dashboard
  return (
    <MemberDashboard
      user={user}
      token={token}
      menus={menus}
      mealRate={mealRate}
      onRefreshStats={refreshSystemData}
    />
  );
}
