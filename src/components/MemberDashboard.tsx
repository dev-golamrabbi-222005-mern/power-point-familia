'use client';

import React, { useState } from 'react';
import { User, MealMenu } from '../types';
import OverviewTab from './dashboard/(member)/OverviewTab';

interface MemberDashboardProps {
  user: User;
  token: string;
  menus?: MealMenu[];
  mealRate?: number;
  onRefreshStats?: () => Promise<void> | void;
  onError?: (msg: string) => void;
}

export default function MemberDashboard({
  user,
  token,
  menus,
  mealRate,
  onRefreshStats,
  onError,
}: MemberDashboardProps) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    if (onError) onError(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Greeting */}
      <div>
        <h1 className="section-title text-zinc-100 mb-1">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-xs md:text-sm text-zinc-400">
          Member Dashboard Overview •{' '}
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs text-red-400 font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Member Overview Content */}
      <OverviewTab token={token} onError={handleError} />
    </div>
  );
}
