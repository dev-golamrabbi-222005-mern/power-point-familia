import React, { useState, useEffect } from 'react';
import { Utensils, Shield, CheckCircle2, TrendingUp, Users, ArrowRight, Sparkles, BookOpen, ShoppingCart, X, CalendarDays, Receipt, Eye, Image as ImageIcon, Sun, Moon } from 'lucide-react';

import { MealMenu, BazaarAssignment, BazaarExpense } from '../types';

interface HeroProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onDemoLogin: (email: string) => void;
  menus: MealMenu[];
  mealRate: number;
}

export default function Hero({ onLoginClick, onRegisterClick, onDemoLogin, menus, mealRate }: HeroProps) {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayMenus = menus.filter(m => m.date === todayDate);

  const [bazaarAssignments, setBazaarAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [bazaarExpenses, setBazaarExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [bazaarPairData, setBazaarPairData] = useState<any>(null);
  const [mealSummary, setMealSummary] = useState<{ date: string; lunch: number; dinner: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    // Fetch public calendar data
    const fetchCalendarData = async () => {
      try {
        const res = await fetch('/api/public/calendar');
        if (res.ok) {
          const data = await res.json();
          setBazaarAssignments(data.assignments || []);
          setBazaarExpenses(data.expenses || []);
          setBazaarPairData(data.currentPair ? { currentPair: data.currentPair, nextPair: data.nextPair, pairs: data.pairs, currentPairIndex: data.currentPairIndex } : null);
          setMealSummary(data.mealSummary || []);
        }
      } catch (e) {
        // Silent fail
      }
    };
    fetchCalendarData();
  }, []);

  // Full Month Calendar helpers
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });

  // Get full activity info for a specific date
  const getDayInfo = (date: string) => {
    const assignments = bazaarAssignments.filter(a => a.date === date);
    const expenses = bazaarExpenses.filter(e => e.date === date);
    const dayMenus = menus.filter(m => m.date === date);
    const totalSpent = expenses.reduce((s, e) => s + e.totalCost, 0);
    const dayNames = assignments.map(a => a.userName).filter(Boolean);
    const dayMealSummary = mealSummary.find(m => m.date === date);
    const hasReceipt = expenses.some(e => !!e.receiptImage);
    return { assignments, expenses, menus: dayMenus, totalSpent, assignedTo: dayNames, mealCounts: dayMealSummary, hasReceipt };
  };

  // Enlarge popup for receipt images
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);

  const demoAccounts = [
    { name: 'Admin', email: 'admin@familia.com', desc: 'Manage users, assign roles & set rates' },
    { name: 'Manager', email: 'manager@familia.com', desc: 'Publish daily menus & approve deposits' },
    { name: 'Member', email: 'member@familia.com', desc: 'Book daily meals & request deposits' },
    { name: 'Guest', email: 'guest@familia.com', desc: 'Pending user, update profile setup' }
  ];

  return (
    <div id="home-landing" className="relative overflow-hidden pt-12 pb-24 bg-[#0a0a0a]">
      {/* Decorative background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-full shadow-sm tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cohesive Meal Management Ecosystem</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-100 leading-none">
              Smart dining, <br />
              <span className="italic font-serif text-emerald-500">Perfectly managed</span> <br />
              for your familia.
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              Power Point Familia coordinates meal schedules, daily menus, and financial balances with absolute transparent data isolation. Built for families, shared apartments, and small organizations.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="btn-register-hero"
                onClick={onRegisterClick}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-150 flex items-center gap-2 cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                id="btn-login-hero"
                onClick={onLoginClick}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium border border-zinc-800 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-8 mt-12">
              <div>
                <p className="text-3xl font-light text-zinc-100">{mealRate}৳</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Standard Meal Rate</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-100">4 Tiers</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">RBAC Access Levels</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-100">100%</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Food Waste Free</p>
              </div>
            </div>
          </div>

          {/* Today's Menu Display */}
          <div className="lg:col-span-5 bg-[#111111] border border-zinc-800/80 shadow-2xl rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live System Active</span>
            </div>
            
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-100">Today's Menu</h3>
                <p className="text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {todayMenus.length > 0 ? (
              <div className="space-y-4">
                {todayMenus.map((menu) => (
                  <div key={menu.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                    <div className="flex justify-between items-center mb-2">
                      <span className="capitalize text-[10px] font-bold text-zinc-400 tracking-wider bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800/80 shadow-xs">
                        {menu.mealType}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/15">
                        Est. Cost: {menu.estimatedCost}৳
                      </span>
                    </div>
                    <ul className="grid grid-cols-2 gap-2 text-zinc-300 text-sm mt-3 font-sans">
                      {menu.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 font-medium">Menu is pending publication.</p>
                <p className="text-xs text-zinc-500 mt-1">Managers publish menus daily!</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Demo Testing Shortcut</h4>
              <p className="text-xs text-zinc-400 mb-3">Instantly simulate any RBAC access level with a pre-seeded account:</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    id={`btn-demo-${acc.name.toLowerCase()}`}
                    onClick={() => onDemoLogin(acc.email)}
                    className="p-2 bg-[#18181b]/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-left transition-all text-xs hover:border-emerald-500/40 shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-200">
                      <span>{acc.name}</span>
                      <span className="text-[10px] text-emerald-500 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{acc.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2.5 text-center text-[10px] text-zinc-400 font-medium bg-zinc-950/50 py-1.5 rounded border border-zinc-800/80">
                Default Password: <span className="font-mono bg-zinc-900 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-800">password123</span>
              </div>
            </div>
          </div>

        </div>
      </div>        {/* Current Bazaar Pair */}
      {bazaarPairData && bazaarPairData.currentPair && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/15 rounded-xl">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Current Bazaar Pair</p>
                <p className="text-lg font-black text-zinc-100">
                  {bazaarPairData.currentPair.member1Name} <span className="text-zinc-500 text-sm">&</span> {bazaarPairData.currentPair.member2Name}
                </p>
                {bazaarPairData.nextPair && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Next up: {bazaarPairData.nextPair.member1Name} & {bazaarPairData.nextPair.member2Name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-blue-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

        {/* Bazaar Calendar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight sm:text-4xl flex items-center justify-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-500" />
            Bazaar & Expenses Calendar
          </h2>
          <p className="mt-3 text-zinc-400">
            View upcoming bazaar schedules, expenses, and purchase details at a glance.
            Click on any date to see what was bought and how much was spent.
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-emerald-500" />
            <h3 className="font-display font-bold text-lg text-zinc-100">Activity Calendar</h3>
            <span className="ml-auto text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="overflow-x-auto -mx-2 px-2 pb-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 min-w-[420px] sm:min-w-0">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Full Month Grid */}
          <div className="grid grid-cols-7 gap-1 min-w-[420px] sm:min-w-0">
              {/* Empty cells for days before the 1st */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {monthDates.map((date) => {
                const dayNum = new Date(date).getDate();
                const info = getDayInfo(date);
                const isPast = new Date(date) < new Date(new Date().toDateString());
                const isToday = date === new Date().toISOString().split('T')[0];
                const hasActivity = info.assignments.length > 0 || info.expenses.length > 0 || info.menus.length > 0 || (info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0));

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                    className={`relative p-1.5 rounded-lg border text-left transition-all duration-200 min-h-[60px] sm:min-h-[72px] cursor-pointer ${
                      isToday
                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : isPast && !hasActivity
                        ? 'bg-zinc-900/10 border-transparent opacity-30'
                        : 'bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/30 hover:bg-zinc-900/60'
                    } ${selectedDate === date ? 'ring-2 ring-emerald-500/30' : ''} ${!hasActivity ? 'pointer-events-none' : ''}`}
                  >
                    <span className={`text-[10px] sm:text-[11px] font-bold ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {dayNum}
                    </span>
                    <div className="flex flex-col gap-px mt-0.5">
                      {info.assignments.length > 0 && (
                        <span className="text-[6px] sm:text-[7px] text-emerald-400 font-bold leading-tight truncate">🛒 {info.assignments.length}</span>
                      )}
                      {info.totalSpent > 0 && (
                        <span className="text-[6px] sm:text-[7px] text-amber-400 font-bold leading-tight truncate">
                          💰{info.totalSpent}৳{info.hasReceipt && '📎'}
                        </span>
                      )}
                      {info.menus.length > 0 && (
                        <span className="text-[6px] sm:text-[7px] text-teal-400 font-bold leading-tight truncate">
                          🍽️ {info.menus.filter(m => m.mealType === 'lunch').length > 0 ? 'L' : ''}{info.menus.filter(m => m.mealType === 'lunch').length > 0 && info.menus.filter(m => m.mealType === 'dinner').length > 0 ? '+' : ''}{info.menus.filter(m => m.mealType === 'dinner').length > 0 ? 'D' : ''}
                        </span>
                      )}
                      {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                        <span className="text-[6px] sm:text-[7px] text-purple-400 font-bold leading-tight truncate">
                          📊 {info.mealCounts.lunch > 0 ? info.mealCounts.lunch : ''}{info.mealCounts.lunch > 0 && info.mealCounts.dinner > 0 ? '/' : ''}{info.mealCounts.dinner > 0 ? info.mealCounts.dinner : ''}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Receipt Modal */}
      {enlargedReceipt && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setEnlargedReceipt(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setEnlargedReceipt(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={enlargedReceipt} alt="Receipt full size" className="w-full h-auto rounded-2xl shadow-2xl border border-zinc-800" />
          </div>
        </div>
      )}

      {/* Bazaar Detail Popup */}
      {selectedDate && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDate(null)}>
          <div 
            className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs text-zinc-500">Bazaar & Purchase Details</p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const info = getDayInfo(selectedDate);
                const hasActivity = info.assignments.length > 0 || info.expenses.length > 0 || info.menus.length > 0;
                
                if (!hasActivity) {
                  return (
                    <div className="text-center py-8">
                      <CalendarDays className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 font-medium">No activity on this date</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Meal Booking Counts */}
                    {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                      <div className="p-4 bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl mb-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <Utensils className="w-4 h-4" /> Meal Bookings
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
                            <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-zinc-100">{info.mealCounts.lunch}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Lunch</p>
                          </div>
                          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
                            <Moon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-zinc-100">{info.mealCounts.dinner}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Dinner</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Today's Menus */}
                    {info.menus.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                          <Utensils className="w-4 h-4" /> Daily Menus — Lunch & Dinner
                        </h4>
                        {info.menus.map((menu) => (
                          <div key={menu.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded ${menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'}`}>{menu.mealType}</span>
                              <span className="text-xs font-semibold text-emerald-400">Est: {menu.estimatedCost}৳</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {menu.items.map((item, i) => (
                                <span key={i} className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg">{item}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bazaar Assignments */}
                    {info.assignments.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" /> Bazaar Assignments
                        </h4>
                        {info.assignments.map((assignment) => (
                          <div key={assignment.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-zinc-200 text-sm">Assigned to: {assignment.userName || 'Member'}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                assignment.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                                assignment.status === 'submitted' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>{assignment.status}</span>
                            </div>
                            {assignment.shoppingList.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {assignment.shoppingList.map((item, i) => (
                                  <span key={i} className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg">{item}</span>
                                ))}
                              </div>
                            )}
                            {assignment.delegatedFrom && (
                              <p className="text-[10px] text-amber-400 mt-2">🔄 Delegated from original assignee</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expenses */}
                    {info.expenses.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Receipt className="w-4 h-4" /> Expenses ({info.totalSpent}৳ total)
                        </h4>
                        {info.expenses.map((expense) => (
                          <div key={expense.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-zinc-200 text-sm">Purchases by: {expense.userName || 'Member'}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-400">{expense.totalCost}৳</span>
                                {expense.receiptImage && (
                                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-blue-500/20" title="Receipt uploaded">
                                    <ImageIcon className="w-3 h-3" /> Receipt
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  expense.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                                  expense.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>{expense.status}</span>
                              </div>
                            </div>
                            {/* Itemized expense breakdown */}
                            <div className="space-y-1.5 mb-3">
                              {expense.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                  <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-zinc-200">{item.cost}৳</span>
                                </div>
                              ))}
                            </div>
                            {/* Receipt image */}
                            {expense.receiptImage && (
                              <div className="mt-2 pt-3 border-t border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5" /> Receipt
                                  </span>
                                  <button
                                    onClick={() => setEnlargedReceipt(expense.receiptImage!)}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                                  >
                                    View Full Size
                                  </button>
                                </div>
                                <div className="relative">
                                  <img
                                    src={expense.receiptImage}
                                    alt="Purchase receipt"
                                    className="w-full max-h-32 object-contain rounded-lg bg-zinc-900/70 border border-zinc-800 cursor-pointer"
                                    onClick={() => setEnlargedReceipt(expense.receiptImage!)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight sm:text-4xl">
            Designed for transparent dining management
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Power Point Familia implements explicit data separation and actions for each administrative tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              1
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              Role-Based Isolations
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Strict RBAC enforcement prevents access crossover. Guests, members, managers, and developer admins work in custom dashboards.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              2
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" />
              Flexible Bookings
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Members book exact meal counts for lunch or dinner. Meal schedules can be customized up to several days in advance.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              3
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Rate Engine
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Dynamic financial balances. Every consumed meal is factored into a member's ledger instantly against their approved deposits.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              4
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Family Centered
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Designed for transparency. No hidden charges, fully real-time ledgers, and profile editing to keep phone and contact info fresh.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
