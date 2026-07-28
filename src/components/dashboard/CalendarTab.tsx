'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Utensils, Sun, Users, ShoppingBag, DollarSign, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { CalendarActivityData, BazaarDutyInfo } from '@/src/types';

interface CalendarTabProps {
  token: string;
  onError?: (msg: string) => void;
}

interface MonthCalendar {
  year: number;
  month: number;
  days: (number | null)[];
  firstDay: number;
  daysInMonth: number;
}

export default function CalendarTab({ token, onError }: CalendarTabProps) {
  const [activities, setActivities] = useState<Record<string, CalendarActivityData> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Bazaar duty info state for selected or today's date
  const [bazaarDuty, setBazaarDuty] = useState<BazaarDutyInfo | null>(null);
  const [dutyLoading, setDutyLoading] = useState(false);

  // Bajar Expense Submission State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bazaarItemsInput, setBazaarItemsInput] = useState('');
  const [bazaarTotalCostInput, setBazaarTotalCostInput] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const handleSubmitBazaarExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bazaarDuty?.assignmentId) return;

    try {
      setSubmittingExpense(true);
      const parsedItems = bazaarItemsInput.split(',').map(i => {
        const parts = i.trim().split('-');
        const name = parts[0]?.trim() || i.trim();
        const cost = Number(parts[1]?.trim() || 0);
        return { name, cost };
      }).filter(i => i.name);

      const res = await fetch('/api/bazaar/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId: bazaarDuty.assignmentId,
          date: bazaarDuty.date,
          items: parsedItems.length > 0 ? parsedItems : [{ name: 'Bazaar Items', cost: Number(bazaarTotalCostInput || 0) }],
          totalCost: Number(bazaarTotalCostInput || 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      alert(data.message || 'Bajar expense submitted successfully!');
      setShowSubmitModal(false);
      fetchBazaarDuty(bazaarDuty.date);
    } catch (err: any) {
      alert(err.message || 'Error submitting expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/calendar-activities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activitiesByDate);
      }
    } catch (error) {
      console.error('Error fetching calendar activities', error);
      onError?.('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBazaarDuty = async (dateStr: string) => {
    try {
      setDutyLoading(true);
      const res = await fetch(`/api/dashboard/calendar-bazaar-duty?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBazaarDuty(data);
      }
    } catch (error) {
      console.error('Error fetching bazaar duty info', error);
    } finally {
      setDutyLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const todayStr = new Date().toISOString().split('T')[0];
    fetchBazaarDuty(todayStr);
  }, [token]);

  const handleDateSelect = (dateStr: string) => {
    const newSelected = selectedDate === dateStr ? null : dateStr;
    setSelectedDate(newSelected);
    const targetDate = newSelected || new Date().toISOString().split('T')[0];
    fetchBazaarDuty(targetDate);
  };

  const getCalendar = (year: number, month: number): MonthCalendar => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return { year, month, days, firstDay, daysInMonth };
  };

  const getDateString = (day: number): string => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const hasActivity = (day: number): boolean => {
    if (!activities) return false;
    const dateStr = getDateString(day);
    return !!activities[dateStr];
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const calendar = getCalendar(currentDate.getFullYear(), currentDate.getMonth());
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedActivity = selectedDate && activities ? activities[selectedDate] : null;
  const activeDateDisplay = selectedDate || new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* === CALENDAR HEADER & GRID === */}
      <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              →
            </button>
          </div>
        </div>

        {/* === WEEKDAY HEADERS === */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-semibold text-zinc-600 dark:text-zinc-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* === CALENDAR GRID === */}
        <div className="grid grid-cols-7 gap-1">
          {calendar.days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const dateStr = getDateString(day);
            const isSelected = selectedDate === dateStr;
            const hasAct = hasActivity(day);
            const today = new Date().toISOString().split('T')[0];
            const isToday = dateStr === today;

            return (
              <button
                key={day}
                onClick={() => handleDateSelect(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs md:text-sm font-semibold transition-colors relative cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isToday
                    ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                    : hasAct
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-600'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{day}</span>
                {hasAct && (
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* === BAZAAR DUTY SCHEDULE SECTION (UNDER CALENDAR) === */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white">
              Bazaar Duty Schedule ({activeDateDisplay})
            </h3>
          </div>
          {selectedDate ? (
            <button 
              onClick={() => handleDateSelect(selectedDate)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Reset to Today
            </button>
          ) : (
            <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
              Today
            </span>
          )}
        </div>

        {dutyLoading ? (
          <div className="p-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span>Checking bazaar schedule...</span>
          </div>
        ) : bazaarDuty?.hasDuty ? (
          /* HAS BAZAAR DUTY TODAY / SELECTED DATE */
          <div className="p-4 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:to-zinc-900 rounded-xl border border-orange-300 dark:border-orange-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Bazaar Duty Assigned!
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pair Partner: <span className="font-bold text-orange-600 dark:text-orange-400">{bazaarDuty.pairPartnerName}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full border border-orange-500/30">
                Budget: ৳{bazaarDuty.budget}
              </span>
            </div>

            {/* Manager Shopping List */}
            {bazaarDuty.shoppingList && bazaarDuty.shoppingList.length > 0 && (
              <div className="bg-white/80 dark:bg-zinc-800/80 p-3 rounded-lg border border-orange-200/60 dark:border-orange-900/40">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                  Manager Requested Shopping List:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bazaarDuty.shoppingList.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-medium px-2.5 py-1 bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 rounded-md border border-orange-200 dark:border-orange-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Status & Action */}
            {bazaarDuty.submittedDetails || bazaarDuty.status === 'submitted' || bazaarDuty.status === 'verified' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider">
                    {bazaarDuty.status === 'verified' ? '✓ Verified & Accepted by Manager' : '✓ Submitted (Awaiting Manager Acceptance)'}
                  </span>
                  <span className="font-black text-emerald-300 text-sm">৳{bazaarDuty.submittedDetails?.totalCost || 0}</span>
                </div>
                {bazaarDuty.submittedDetails?.submittedByName && (
                  <p className="text-zinc-400">Submitted by: <strong className="text-emerald-300">{bazaarDuty.submittedDetails.submittedByName}</strong></p>
                )}
                {bazaarDuty.submittedDetails?.items && bazaarDuty.submittedDetails.items.length > 0 && (
                  <p className="text-zinc-500 truncate">Items: {bazaarDuty.submittedDetails.items.map(i => `${i.name} (${i.cost}৳)`).join(', ')}</p>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Submit Bajar Cost & List</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* NO BAZAAR DUTY (HOLIDAY) */
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:to-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-extrabold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                It's your holiday today! 🎉
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                No bazaar duty scheduled for you on {activeDateDisplay}. Relax and enjoy your day!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* === ACTIVITY MODAL === */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-sm w-full max-h-96 overflow-y-auto border border-zinc-200 dark:border-zinc-700">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {selectedActivity.dayName}, {new Date(selectedActivity.date + 'T00:00:00').toLocaleDateString()}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Meals Summary */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Meals</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400">Total</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {selectedActivity.mealSummary.totalMeals}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400">Lunch</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {selectedActivity.mealSummary.lunch}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-600 dark:text-emerald-400">Dinner</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {selectedActivity.mealSummary.dinner}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bazaar Details */}
              {selectedActivity.bazaarDetails.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      Bazaar ({selectedActivity.bazaarCount})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {selectedActivity.bazaarDetails.map((bazaar, idx) => (
                      <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-200 dark:border-orange-700 text-xs">
                        <div className="flex justify-between mb-1">
                          <p className="font-semibold text-orange-900 dark:text-orange-100">{bazaar.userName}</p>
                          <p className="font-bold text-orange-700 dark:text-orange-300">৳{bazaar.totalCost}</p>
                        </div>
                        <p className="text-orange-700 dark:text-orange-400 line-clamp-2">{bazaar.items}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">Total Bazaar</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">৳{selectedActivity.totalBazaarCost}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-center text-xs text-zinc-600 dark:text-zinc-400">
                  No bazaar activity on this day
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT BAJAR EXPENSE MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                Submit Bajar List & Actual Cost
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBazaarExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Purchased Items & Individual Costs
                </label>
                <input
                  type="text"
                  required
                  value={bazaarItemsInput}
                  onChange={(e) => setBazaarItemsInput(e.target.value)}
                  placeholder="e.g. Chicken - 600, Rice - 400, Oil - 200, Veggies - 150"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Format: ItemName - Cost (Comma separated)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Actual Bajar Cost (৳)
                </label>
                <input
                  type="number"
                  required
                  value={bazaarTotalCostInput}
                  onChange={(e) => setBazaarTotalCostInput(e.target.value)}
                  placeholder="e.g. 1350"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingExpense ? 'Submitting...' : 'Submit Bajar Cost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
