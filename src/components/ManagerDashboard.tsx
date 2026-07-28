'use client';

import React, { useState, useEffect } from 'react';
import { User, MealMenu, SystemSettings } from '../types';
import ManagerOverviewTab from './dashboard/ManagerOverviewTab';
import ManagerTicketsTab from './dashboard/ManagerTicketsTab';
import ManagerMealsTab from './dashboard/ManagerMealsTab';
import ManagerFinanceTab from './dashboard/ManagerFinanceTab';
import ManagerHistoryTab from './dashboard/ManagerHistoryTab';
import { 
  TrendingUp, 
  ClipboardList, 
  ChefHat, 
  DollarSign, 
  History, 
  RefreshCw, 
  CalendarDays, 
  Utensils 
} from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  token: string;
  menus: MealMenu[];
  mealRate: number;
  onRefreshMenus: () => void;
}

export type ManagerTabType = 'overview' | 'tickets' | 'meals' | 'finances' | 'history';

export default function ManagerDashboard({ user, token, menus, mealRate, onRefreshMenus }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState<ManagerTabType>('overview');
  const [prefillWarnUserId, setPrefillWarnUserId] = useState<string | null>(null);

  // Auto-book toggle & settings state
  const [autoBookEnabled, setAutoBookEnabled] = useState(true);
  const [autoBookLoading, setAutoBookLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Month end reset status
  const [resetStatusMsg, setResetStatusMsg] = useState('');
  const [initiateResetLoading, setInitiateResetLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.autoBookMeals !== undefined) {
          setAutoBookEnabled(data.autoBookMeals);
        }
      }
    } catch (err) {
      console.error('Error fetching settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleToggleAutoBook = async () => {
    try {
      setAutoBookLoading(true);
      const nextVal = !autoBookEnabled;
      const res = await fetch('/api/settings/auto-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ autoBookMeals: nextVal }),
      });
      if (res.ok) {
        setAutoBookEnabled(nextVal);
      }
    } catch (err) {
      console.error('Auto book toggle error', err);
    } finally {
      setAutoBookLoading(false);
    }
  };

  const handleInitiateMonthEnd = async () => {
    if (!window.confirm('Initiate Month-End Reset calculation and submit request to Admin?')) return;
    try {
      setInitiateResetLoading(true);
      const res = await fetch('/api/month-end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'initiate' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Initiate reset failed');
      setResetStatusMsg('Month-End Reset initiated successfully! Sent to Admin for final approval.');
    } catch (err: any) {
      alert(err.message || 'Month end reset error');
    } finally {
      setInitiateResetLoading(false);
    }
  };

  const handleNavigateToTicketsWithWarning = (userId?: string) => {
    if (userId) {
      setPrefillWarnUserId(userId);
    }
    setActiveTab('tickets');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tickets', label: 'Tickets', icon: ClipboardList },
    { id: 'meals', label: 'Meals & Bazaar', icon: ChefHat },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Permanent Month-End Reset Control Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 via-zinc-900 to-amber-900/20 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <RefreshCw className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2">
              Month-End Reset & Carry-Forward Engine
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                Manager Control
              </span>
            </h4>
            <p className="text-xs text-zinc-400">
              Calculate total month expenses, live meal rate, member carry-forward balances, and send request to Admin.
            </p>
            {resetStatusMsg && <p className="text-xs text-emerald-400 font-bold mt-1">{resetStatusMsg}</p>}
          </div>
        </div>
        <button
          onClick={handleInitiateMonthEnd}
          disabled={initiateResetLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${initiateResetLoading ? 'animate-spin' : ''}`} />
          <span>Initiate Month-End Reset</span>
        </button>
      </div>

      {/* Manager Control Center Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-teal-600/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Manager Control Center</p>
            <p className="text-lg md:text-xl font-black text-zinc-100">
              Power Point Familia Manager Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as ManagerTabType);
              if (tab.id !== 'tickets') setPrefillWarnUserId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB CONTENTS === */}
      {activeTab === 'overview' && (
        <ManagerOverviewTab token={token} onError={(msg) => console.error(msg)} />
      )}

      {activeTab === 'tickets' && (
        <ManagerTicketsTab
          token={token}
          onRefreshData={() => {}}
          prefillWarnUserId={prefillWarnUserId}
        />
      )}

      {activeTab === 'meals' && (
        <ManagerMealsTab
          token={token}
          menus={menus}
          onRefreshMenus={onRefreshMenus}
        />
      )}

      {activeTab === 'finances' && (
        <ManagerFinanceTab
          token={token}
          onNavigateToTickets={handleNavigateToTicketsWithWarning}
        />
      )}

      {activeTab === 'history' && (
        <ManagerHistoryTab token={token} />
      )}
    </div>
  );
}
