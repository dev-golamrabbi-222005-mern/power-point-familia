'use client';

import React, { useState } from 'react';
import { BarChart3, Calendar, Utensils, Wallet, History } from 'lucide-react';
import { User, MealMenu } from '../types';
import OverviewTab from './dashboard/OverviewTab';
import CalendarTab from './dashboard/CalendarTab';
import MealTab from './dashboard/MealTab';
import FinanceTab from './dashboard/FinanceTab';
import HistoryTab from './dashboard/HistoryTab';

interface MemberDashboardProps {
  user: User;
  token: string;
  menus?: MealMenu[];
  mealRate?: number;
  onRefreshStats?: () => Promise<void> | void;
  onError?: (msg: string) => void;
}

type TabType = 'overview' | 'calendar' | 'meals' | 'finance' | 'history';

export default function MemberDashboard({ user, token, onError }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [errorMsg, setErrorMsg] = useState('');

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Member Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Tab Navigation - Mobile First */}
        <div className="mb-4 md:mb-6 flex gap-2 overflow-x-auto pb-1">
          {/* Overview Tab */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
            <span>Overview</span>
          </button>

          {/* Calendar Tab */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            <span>Calendar</span>
          </button>

          {/* Meals Tab */}
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'meals'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <Utensils className="w-4 h-4 md:w-5 md:h-5" />
            <span>Meals</span>
          </button>

          {/* Finance Tab (4th Tab) */}
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <Wallet className="w-4 h-4 md:w-5 md:h-5" />
            <span>Finance</span>
          </button>

          {/* History Tab (5th Tab) */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600'
            }`}
          >
            <History className="w-4 h-4 md:w-5 md:h-5" />
            <span>History</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 md:p-6 shadow-sm">
          {activeTab === 'overview' && <OverviewTab token={token} onError={handleError} />}
          {activeTab === 'calendar' && <CalendarTab token={token} onError={handleError} />}
          {activeTab === 'meals' && <MealTab token={token} onError={handleError} />}
          {activeTab === 'finance' && <FinanceTab token={token} onError={handleError} />}
          {activeTab === 'history' && <HistoryTab token={token} onError={handleError} />}
        </div>
      </div>
    </div>
  );
}
