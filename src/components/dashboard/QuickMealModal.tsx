'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/src/context/DashboardContext';
import { Utensils, X, Sun, Moon, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface MealStatus {
  mealType: 'lunch' | 'dinner';
  isOn: boolean;
}

interface QuickDay {
  dateStr: string;
  label: string;
  lunch: boolean;
  dinner: boolean;
}

export default function QuickMealModal() {
  const { token, isQuickMealOpen, setIsQuickMealOpen, refreshAll } = useDashboard();
  const [days, setDays] = useState<QuickDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchQuickMeals = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const today = new Date();
      const datesToFetch = [
        { d: new Date(today), label: 'Today (' + today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ')' },
        { d: new Date(today.getTime() + 86400000), label: 'Tomorrow (' + new Date(today.getTime() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ')' },
      ];

      const loadedDays: QuickDay[] = [];

      for (const item of datesToFetch) {
        const dateStr = item.d.toISOString().split('T')[0];
        const res = await fetch(`/api/records/toggle-meal?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const lunchRec = data.records?.find((r: any) => r.mealType === 'lunch');
          const dinnerRec = data.records?.find((r: any) => r.mealType === 'dinner');
          loadedDays.push({
            dateStr,
            label: item.label,
            lunch: lunchRec ? lunchRec.isOn : true,
            dinner: dinnerRec ? dinnerRec.isOn : true,
          });
        } else {
          loadedDays.push({
            dateStr,
            label: item.label,
            lunch: true,
            dinner: true,
          });
        }
      }

      setDays(loadedDays);
    } catch (e: any) {
      setErrorMsg('Failed to load meal status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isQuickMealOpen) {
      fetchQuickMeals();
    }
  }, [isQuickMealOpen, token]);

  const handleToggle = async (dateStr: string, mealType: 'lunch' | 'dinner', currentVal: boolean) => {
    if (!token) return;
    const toggleKey = `${dateStr}-${mealType}`;
    setToggling(toggleKey);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const action = currentVal ? 'off' : 'on';
      const res = await fetch('/api/records/toggle-meal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateStr, mealType, action }),
      });

      if (res.ok) {
        setDays(prev =>
          prev.map(d =>
            d.dateStr === dateStr ? { ...d, [mealType]: !currentVal } : d
          )
        );
        setSuccessMsg(`Toggled ${mealType} ${action === 'on' ? 'ON' : 'OFF'}!`);
        refreshAll();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Cannot change meal at this hour');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
    } finally {
      setToggling(null);
    }
  };

  if (!isQuickMealOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-100">
                Quick Meal Toggle
              </h3>
              <p className="text-xs text-zinc-400">
                Instant meal booking for Today & Tomorrow
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickMealOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status messages */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
              <p className="text-xs text-zinc-400">Fetching current meal statuses...</p>
            </div>
          ) : (
            days.map(day => (
              <div
                key={day.dateStr}
                className="p-4 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    {day.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {day.dateStr}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Lunch Toggle */}
                  <button
                    onClick={() => handleToggle(day.dateStr, 'lunch', day.lunch)}
                    disabled={toggling === `${day.dateStr}-lunch`}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      day.lunch
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Lunch</p>
                        <p className="text-[10px] opacity-80">
                          {day.lunch ? 'Active (ON)' : 'Cancelled (OFF)'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                        day.lunch
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {toggling === `${day.dateStr}-lunch` ? '...' : day.lunch ? '✓' : '✕'}
                    </div>
                  </button>

                  {/* Dinner Toggle */}
                  <button
                    onClick={() => handleToggle(day.dateStr, 'dinner', day.dinner)}
                    disabled={toggling === `${day.dateStr}-dinner`}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      day.dinner
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Dinner</p>
                        <p className="text-[10px] opacity-80">
                          {day.dinner ? 'Active (ON)' : 'Cancelled (OFF)'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                        day.dinner
                          ? 'bg-indigo-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {toggling === `${day.dateStr}-dinner` ? '...' : day.dinner ? '✓' : '✕'}
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Rule: Lunch by 9 AM, Dinner by 5 PM</span>
          <button
            onClick={() => setIsQuickMealOpen(false)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
