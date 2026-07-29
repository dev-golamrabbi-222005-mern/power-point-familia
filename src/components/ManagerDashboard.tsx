'use client';

import React, { useState, useEffect } from 'react';
import { User, MealMenu, SystemSettings } from '../types';
import ManagerOverviewTab from './dashboard/(manager)/ManagerOverviewTab';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  token: string;
  menus: MealMenu[];
  mealRate: number;
  onRefreshMenus: () => void;
}

export default function ManagerDashboard({
  user,
  token,
  menus,
  mealRate,
  onRefreshMenus,
}: ManagerDashboardProps) {
  const [autoBookEnabled, setAutoBookEnabled] = useState(true);
  const [autoBookLoading, setAutoBookLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

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
            {resetStatusMsg && (
              <p className="text-xs text-emerald-400 font-bold mt-1">{resetStatusMsg}</p>
            )}
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
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Manager Control Center
            </p>
            <p className="text-lg md:text-xl font-black text-zinc-100">
              Power Point Familia Manager Overview
            </p>
          </div>
        </div>
      </div>

      {/* Manager Overview Content */}
      <ManagerOverviewTab token={token} onError={(msg) => console.error(msg)} />
    </div>
  );
}
