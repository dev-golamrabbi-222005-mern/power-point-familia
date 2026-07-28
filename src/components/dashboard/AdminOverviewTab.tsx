import React, { useState, useEffect } from 'react';
import { User, MealMenu, BazaarAssignment, BazaarExpense } from '@/src/types';
import { Users, ShieldCheck, ShieldAlert, CheckCircle2, DollarSign, Utensils, CalendarDays, ShoppingCart, Receipt, X, Image as ImageIcon, Sun, Moon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface AdminOverviewTabProps {
  token: string;
  allUsers: User[];
  menus: MealMenu[];
  mealRate: number;
}

export default function AdminOverviewTab({ token, allUsers, menus, mealRate }: AdminOverviewTabProps) {
  const [publicAssignments, setPublicAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [publicExpenses, setPublicExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [mealSummary, setMealSummary] = useState<{ date: string; lunch: number; dinner: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);
  const [financeOverview, setFinanceOverview] = useState<any>(null);

  const fetchPublicCalendar = async () => {
    try {
      const res = await fetch('/api/public/calendar');
      if (res.ok) {
        const data = await res.json();
        setPublicAssignments(data.assignments || []);
        setPublicExpenses(data.expenses || []);
        setMealSummary(data.mealSummary || []);
      }
    } catch (e) {}
  };

  const fetchFinanceOverview = async () => {
    try {
      const res = await fetch('/api/finance/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFinanceOverview(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPublicCalendar();
    fetchFinanceOverview();
  }, [token]);

  const totalRegistrations = allUsers.length;
  const pendingRegistrations = allUsers.filter(u => u.status === 'pending').length;
  const approvedMembers = allUsers.filter(u => u.role === 'member' && u.status === 'approved').length;
  const managersCount = allUsers.filter(u => u.role === 'manager').length;

  const totalLunch = mealSummary.reduce((sum, item) => sum + (item.lunch || 0), 0);
  const totalDinner = mealSummary.reduce((sum, item) => sum + (item.dinner || 0), 0);
  const totalMeals = totalLunch + totalDinner;

  const totalBazaarSpent = publicExpenses.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  // Recharts Data
  const mealDistributionData = [
    { name: 'Lunch', value: totalLunch || 10, color: '#f59e0b' },
    { name: 'Dinner', value: totalDinner || 15, color: '#3b82f6' },
  ];

  const financialTrendData = [
    { month: 'Week 1', collection: (financeOverview?.totalCashInHand || 12000) * 0.25, bazaarSpent: totalBazaarSpent * 0.25 },
    { month: 'Week 2', collection: (financeOverview?.totalCashInHand || 12000) * 0.35, bazaarSpent: totalBazaarSpent * 0.35 },
    { month: 'Week 3', collection: (financeOverview?.totalCashInHand || 12000) * 0.2, bazaarSpent: totalBazaarSpent * 0.2 },
    { month: 'Week 4', collection: (financeOverview?.totalCashInHand || 12000) * 0.2, bazaarSpent: totalBazaarSpent * 0.2 },
  ];

  // Calendar Helpers
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

  const getDayInfo = (date: string) => {
    const assignments = publicAssignments.filter(a => a.date === date);
    const expenses = publicExpenses.filter(e => e.date === date);
    const dayMenus = menus.filter(m => m.date === date);
    const totalSpent = expenses.reduce((s, e) => s + e.totalCost, 0);
    const dayNames = assignments.map(a => a.userName).filter(Boolean);
    const dayMealSummary = mealSummary.find(m => m.date === date);
    const hasReceipt = expenses.some(e => !!e.receiptImage);
    return { assignments, expenses, menus: dayMenus, totalSpent, assignedTo: dayNames, mealCounts: dayMealSummary, hasReceipt };
  };

  return (
    <div className="space-y-6">
      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total System Users</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">{totalRegistrations} Accounts</h3>
            <p className="text-[11px] text-zinc-400 mt-1">{approvedMembers} Members • {managersCount} Managers</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Meals Consumed</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{totalMeals} Plates</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Lunch: {totalLunch} | Dinner: {totalDinner}</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Utensils className="w-6 h-6" /></div>
        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Bazaar Spend</p>
            <h3 className="text-2xl font-black text-purple-400 mt-1">{totalBazaarSpent} ৳</h3>
            <p className="text-[11px] text-zinc-400 mt-1">Live Rate: {mealRate} ৳ / Plate</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><ShoppingCart className="w-6 h-6" /></div>
        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pending Registrations</p>
            <h3 className={`text-2xl font-black mt-1 ${pendingRegistrations > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-100'}`}>
              {pendingRegistrations} Pending
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">Awaiting Admin Verification</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Recharts Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Financial Flow (Bar Chart) */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-zinc-100">Financial Flow Trends (BDT)</h3>
              <p className="text-xs text-zinc-400">Weekly Cash Collection vs Bazaar Purchases</p>
            </div>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="collection" name="Meal Cash Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bazaarSpent" name="Bazaar Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Meal Breakdown (Pie Chart) */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-zinc-100">Meal Distribution</h3>
            <p className="text-xs text-zinc-400">Lunch vs Dinner ratio</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mealDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mealDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-xs text-zinc-300 font-bold">Lunch ({totalLunch})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs text-zinc-300 font-bold">Dinner ({totalDinner})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Calendar Grid */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-emerald-500" />
          <h3 className="font-display font-bold text-lg text-zinc-100">System Activity Calendar</h3>
          <span className="ml-auto text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="overflow-x-auto -mx-2 px-2 pb-1">
          <div className="grid grid-cols-7 gap-1 mb-2 min-w-[420px] sm:min-w-0">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 min-w-[420px] sm:min-w-0">
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
                  className={`relative p-1.5 rounded-lg border text-left transition-all duration-200 min-h-[72px] cursor-pointer ${
                    isToday
                      ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : isPast && !hasActivity
                      ? 'bg-zinc-900/10 border-transparent opacity-30'
                      : 'bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/30 hover:bg-zinc-900/60'
                  } ${selectedDate === date ? 'ring-2 ring-emerald-500/30' : ''} ${!hasActivity ? 'pointer-events-none' : ''}`}
                >
                  <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {dayNum}
                  </span>
                  <div className="flex flex-col gap-px mt-0.5">
                    {info.assignments.length > 0 && (
                      <span className="text-[7px] text-emerald-400 font-bold leading-tight truncate">🛒 {info.assignments.length}</span>
                    )}
                    {info.totalSpent > 0 && (
                      <span className="text-[7px] text-amber-400 font-bold leading-tight truncate">
                        💰{info.totalSpent}৳{info.hasReceipt && '📎'}
                      </span>
                    )}
                    {info.menus.length > 0 && (
                      <span className="text-[7px] text-teal-400 font-bold leading-tight truncate">
                        🍽️ {info.menus.filter(m => m.mealType === 'lunch').length > 0 ? 'L' : ''}{info.menus.filter(m => m.mealType === 'dinner').length > 0 ? 'D' : ''}
                      </span>
                    )}
                    {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                      <span className="text-[7px] text-purple-400 font-bold leading-tight truncate">
                        📊 {info.mealCounts.lunch > 0 ? info.mealCounts.lunch : ''}/{info.mealCounts.dinner > 0 ? info.mealCounts.dinner : ''}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date Detail Popup */}
      {selectedDate && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs text-zinc-500">Activity Overview</p>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const info = getDayInfo(selectedDate);
                return (
                  <div className="space-y-3">
                    {info.mealCounts && (
                      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-around text-center">
                        <div>
                          <p className="text-[10px] text-amber-400 font-bold uppercase">Lunch</p>
                          <p className="text-lg font-black text-zinc-100">{info.mealCounts.lunch}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-400 font-bold uppercase">Dinner</p>
                          <p className="text-lg font-black text-zinc-100">{info.mealCounts.dinner}</p>
                        </div>
                      </div>
                    )}
                    {info.expenses.map(exp => (
                      <div key={exp.id} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-zinc-200">Bazaar: {exp.userName}</p>
                          <p className="text-[10px] text-zinc-500">{exp.items?.length || 0} items</p>
                        </div>
                        <span className="text-xs font-black text-emerald-400">{exp.totalCost}৳</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
