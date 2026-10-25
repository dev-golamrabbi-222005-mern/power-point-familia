'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { User, MealMenu, Deposit } from '@/src/types';

interface DashboardContextType {
  user: User | null;
  token: string | null;
  activeRoleView: 'manager' | 'member';
  setActiveRoleView: (role: 'manager' | 'member') => void;
  toggleRoleView: () => void;
  mealRate: number;
  menus: MealMenu[];
  allUsers: User[];
  loadingUsers: boolean;
  loadingSystem: boolean;
  pendingDepositsCount: number;
  pendingUsersCount: number;
  refreshSystemData: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshDeposits: () => Promise<void>;
  refreshAll: () => Promise<void>;
  // Modal states
  isQuickMealOpen: boolean;
  setIsQuickMealOpen: (open: boolean) => void;
  isQuickExpenseOpen: boolean;
  setIsQuickExpenseOpen: (open: boolean) => void;
  isQuickApproveOpen: boolean;
  setIsQuickApproveOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();

  const [activeRoleView, setActiveRoleView] = useState<'manager' | 'member'>('manager');
  const [mealRate, setMealRate] = useState<number>(45);
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingSystem, setLoadingSystem] = useState<boolean>(true);
  const [pendingDepositsCount, setPendingDepositsCount] = useState<number>(0);

  // Modal states
  const [isQuickMealOpen, setIsQuickMealOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isQuickApproveOpen, setIsQuickApproveOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleRoleView = () => {
    setActiveRoleView(prev => (prev === 'manager' ? 'member' : 'manager'));
  };

  const refreshSystemData = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [menuRes, settingsRes] = await Promise.all([
        fetch('/api/menu', { headers }),
        fetch('/api/settings', { headers }),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenus(menuData);
      }
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setMealRate(sData.mealRate || 45);
      }
    } catch (e) {
      console.error('Error fetching dashboard system data', e);
    } finally {
      setLoadingSystem(false);
    }
  }, [token]);

  const refreshUsers = useCallback(async () => {
    if (!token || !user || (user.role !== 'admin' && user.role !== 'manager')) return;
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const usersData = await res.json();
        setAllUsers(usersData);
      }
    } catch (e) {
      console.error('Error fetching users in dashboard', e);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, user]);

  const refreshDeposits = useCallback(async () => {
    if (!token || !user || (user.role !== 'manager' && user.role !== 'admin')) return;
    try {
      const res = await fetch('/api/deposits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Deposit[] = await res.json();
        const pendingCount = data.filter(d => d.status === 'pending').length;
        setPendingDepositsCount(pendingCount);
      }
    } catch (e) {
      console.error('Error fetching deposits in dashboard', e);
    }
  }, [token, user]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSystemData(), refreshUsers(), refreshDeposits()]);
  }, [refreshSystemData, refreshUsers, refreshDeposits]);

  useEffect(() => {
    if (token) {
      refreshAll();
    }
  }, [token, refreshAll]);

  const pendingUsersCount = allUsers.filter(u => u.status === 'pending').length;

  return (
    <DashboardContext.Provider
      value={{
        user,
        token,
        activeRoleView,
        setActiveRoleView,
        toggleRoleView,
        mealRate,
        menus,
        allUsers,
        loadingUsers,
        loadingSystem,
        pendingDepositsCount,
        pendingUsersCount,
        refreshSystemData,
        refreshUsers,
        refreshDeposits,
        refreshAll,
        isQuickMealOpen,
        setIsQuickMealOpen,
        isQuickExpenseOpen,
        setIsQuickExpenseOpen,
        isQuickApproveOpen,
        setIsQuickApproveOpen,
        isProfileOpen,
        setIsProfileOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
