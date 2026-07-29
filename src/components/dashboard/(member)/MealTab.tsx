'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Check, X, AlertCircle } from 'lucide-react';

interface MealTabProps {
  token: string;
  onError?: (msg: string) => void;
}

interface MealStatus {
  mealType: 'lunch' | 'dinner';
  isOn: boolean;
}

interface MealDay {
  date: string;
  dayLabel: string;
  daysAhead: number;
  lunch: MealStatus;
  dinner: MealStatus;
}

export default function MealTab({ token, onError }: MealTabProps) {
  const [todayMeals, setTodayMeals] = useState<{
    myMeals: number;
    messMeals: number;
    lunch: number;
    dinner: number;
  } | null>(null);
  
  const [upcomingMeals, setUpcomingMeals] = useState<MealDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxToggleDate = new Date(today);
  maxToggleDate.setDate(maxToggleDate.getDate() + 3);

  useEffect(() => {
    fetchMealData();
  }, [token]);

  const fetchMealData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's overview
      const overviewRes = await fetch('/api/dashboard/member-overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (overviewRes.ok) {
        const ovData = await overviewRes.json();
        setTodayMeals({
          myMeals: ovData.todayMyMeals,
          messMeals: ovData.todayMessMeals,
          lunch: 0,
          dinner: 0,
        });
      }

      // Fetch upcoming days (3 days)
      const upcoming: MealDay[] = [];
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const mealRes = await fetch(`/api/records/toggle-meal?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (mealRes.ok) {
          const mealData = await mealRes.json();
          const lunch = mealData.records.find((r: any) => r.mealType === 'lunch');
          const dinner = mealData.records.find((r: any) => r.mealType === 'dinner');
          
          upcoming.push({
            date: dateStr,
            dayLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            daysAhead: i,
            lunch: { mealType: 'lunch', isOn: lunch?.isOn ?? true },
            dinner: { mealType: 'dinner', isOn: dinner?.isOn ?? true },
          });
        }
      }
      setUpcomingMeals(upcoming);
    } catch (error) {
      console.error('Error fetching meal data', error);
      onError?.('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = async (date: string, mealType: 'lunch' | 'dinner', currentState: boolean) => {
    try {
      setToggling(`${date}-${mealType}`);
      
      const action = currentState ? 'off' : 'on';
      const res = await fetch('/api/records/toggle-meal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, mealType, action }),
      });

      if (res.ok) {
        // Update local state
        setUpcomingMeals(prev =>
          prev.map(day =>
            day.date === date
              ? {
                  ...day,
                  [mealType]: { ...day[mealType], isOn: !currentState },
                }
              : day
          )
        );
      } else {
        const error = await res.json();
        onError?.(error.message || `Failed to toggle ${mealType}`);
      }
    } catch (error) {
      console.error('Error toggling meal', error);
      onError?.('Failed to toggle meal');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-400">Loading meal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* === TODAY'S MEAL SUMMARY === */}
      {todayMeals && (
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">Today My</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">{todayMeals.myMeals}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">meals on</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 md:p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300 font-semibold mb-2">Today Mess</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-900 dark:text-purple-100">{todayMeals.messMeals}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">total meals</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-xs md:text-sm text-green-700 dark:text-green-300 font-semibold">Lunch</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">-</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">today</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 md:p-4 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-xs md:text-sm text-orange-700 dark:text-orange-300 font-semibold">Dinner</p>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-900 dark:text-orange-100">-</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">today</p>
          </div>
        </div>
      )}

      {/* === INFO BOX === */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 md:p-4 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-1">Meal On/Off System</p>
          <ul className="space-y-1 text-blue-700 dark:text-blue-300">
            <li>• Turn off meals up to 3 days in advance</li>
            <li>• Manager will be notified when you turn off a meal</li>
            <li>• Auto-booking: meals are pre-enabled if auto-book is on</li>
          </ul>
        </div>
      </div>

      {/* === UPCOMING DAYS === */}
      <div className="space-y-3">
        <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white">Next 3 Days</h3>
        {upcomingMeals.map(day => (
          <div key={day.date} className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm md:text-base font-bold text-zinc-900 dark:text-white">{day.dayLabel}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{day.daysAhead} day{day.daysAhead > 1 ? 's' : ''} ahead</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                Editable
              </span>
            </div>

            {/* Meal toggles */}
            <div className="grid grid-cols-2 gap-2">
              {/* Lunch */}
              <button
                onClick={() => toggleMeal(day.date, 'lunch', day.lunch.isOn)}
                disabled={toggling === `${day.date}-lunch`}
                className={`p-3 rounded-lg border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                  day.lunch.isOn
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                } ${toggling === `${day.date}-lunch` ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs md:text-sm">
                  {day.lunch.isOn ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Dinner */}
              <button
                onClick={() => toggleMeal(day.date, 'dinner', day.dinner.isOn)}
                disabled={toggling === `${day.date}-dinner`}
                className={`p-3 rounded-lg border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                  day.dinner.isOn
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                } ${toggling === `${day.date}-dinner` ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs md:text-sm">
                  {day.dinner.isOn ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* === AUTO-BOOKING SECTION === */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
        <h3 className="text-base font-bold text-purple-900 dark:text-purple-100 mb-3">Auto-Booking System</h3>
        <p className="text-xs md:text-sm text-purple-800 dark:text-purple-200 mb-3">
          When enabled, your meals for the next 3 days are automatically turned on when new menus are published. You can still manually turn them off anytime.
        </p>
        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          Auto-Booking Settings
        </button>
      </div>
    </div>
  );
}
