import React, { useState, useEffect } from 'react';
import { User, UserRole, MealMenu, DashboardStats } from '../types';
import { ShieldAlert, Users, Coins, ShieldCheck, CheckCircle2, Sliders, Save, RefreshCw, AlertCircle, TrendingUp, ClipboardList, ShoppingCart, DollarSign, Calendar, CalendarDays, ChefHat, Utensils, Sun, Moon, Image as ImageIcon, Receipt, Eye, X } from 'lucide-react';
import { BazaarAssignment, BazaarExpense } from '../types';
import ManagerDashboard from './ManagerDashboard';

interface AdminDashboardProps {
  user: User;
  token: string;
  mealRate: number;
  onRefreshSettings: () => void;
}

export default function AdminDashboard({ user, token, mealRate, onRefreshSettings }: AdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rateInput, setRateInput] = useState(mealRate.toString());
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'admin' | 'manager'>('admin');
  const [menus, setMenus] = useState<MealMenu[]>([]);
  
  // Activity Calendar state
  const [publicAssignments, setPublicAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [publicExpenses, setPublicExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [mealSummary, setMealSummary] = useState<{ date: string; lunch: number; dinner: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      const usersRes = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) setAllUsers(usersData);

      const menusRes = await fetch('/api/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (menusRes.ok) setMenus(await menusRes.json());
    } catch (error) {
      console.error('Error in admin fetch', error);
    } finally {
      setLoadingUsers(false);
    }
  };

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

  useEffect(() => {
    fetchAdminData();
    fetchPublicCalendar();
  }, [token]);

  useEffect(() => {
    setRateInput(mealRate.toString());
  }, [mealRate]);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    setLoadingRate(true);

    if (Number(rateInput) <= 0) {
      setSettingsError('Meal rate must be a positive value.');
      setLoadingRate(false);
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mealRate: Number(rateInput) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update.');
      setSettingsSuccess('Meal rate saved globally!');
      onRefreshSettings();
    } catch (err: any) {
      setSettingsError(err.message || 'Error occurred.');
    } finally {
      setLoadingRate(false);
    }
  };

  const handleUpdateUserRoleAndStatus = async (targetId: string, newRole: UserRole, newStatus: User['status']) => {
    if (targetId === user.id) {
      alert('You cannot modify your own roles!');
      return;
    }
    try {
      const response = await fetch(`/api/members/${targetId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole, status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update.');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating user.');
    }
  };

  const totalRegistrations = allUsers.length;
  const pendingRegistrations = allUsers.filter(u => u.status === 'pending').length;
  const managersCount = allUsers.filter(u => u.role === 'manager').length;
  const approvedMembers = allUsers.filter(u => u.role === 'member' && u.status === 'approved').length;

  // Activity Calendar helpers — Full Month Grid
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Switcher */}
      <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
        <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${activeTab === 'admin' ? 'bg-zinc-800 text-zinc-100 shadow-md border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border-transparent'}`}>
          <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
        </button>
        <button onClick={() => setActiveTab('manager')} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${activeTab === 'manager' ? 'bg-zinc-800 text-zinc-100 shadow-md border-zinc-700' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border-transparent'}`}>
          <ChefHat className="w-3.5 h-3.5" /> Manager Tools
        </button>
      </div>

      {/* ===== ACTIVITY CALENDAR ===== */}
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
                      🍽️ {info.menus.filter(m => m.mealType === 'lunch').length > 0 ? 'L' : ''}{info.menus.filter(m => m.mealType === 'lunch').length > 0 && info.menus.filter(m => m.mealType === 'dinner').length > 0 ? '+' : ''}{info.menus.filter(m => m.mealType === 'dinner').length > 0 ? 'D' : ''}
                    </span>
                  )}
                  {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                    <span className="text-[7px] text-purple-400 font-bold leading-tight truncate">
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

      {activeTab === 'manager' ? (
        <ManagerDashboard user={user} token={token} menus={menus} mealRate={mealRate} onRefreshMenus={() => fetchAdminData()} />
      ) : (
        <>
          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Accounts</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{totalRegistrations} Accounts</h3>
              </div>
              <div className="p-3 bg-zinc-800 text-zinc-350 rounded-xl"><Users className="w-6 h-6" /></div>
            </div>
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Awaiting Verification</p>
                <h3 className={`text-2xl font-black mt-1 ${pendingRegistrations > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-100'}`}>{pendingRegistrations} Guests</h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
            </div>
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Verified Members</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{approvedMembers} Members</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
            </div>
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Meal Managers</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{managersCount} Managers</h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Global Settings */}
            <div className="lg:col-span-4 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-500" /> Global System Settings
                </h3>
                <p className="text-xs text-zinc-400">Configure meal rates and system variables</p>
              </div>
              <form onSubmit={handleUpdateRate} className="space-y-4">
                {settingsError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{settingsError}</span></div>}
                {settingsSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{settingsSuccess}</span></div>}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Meal Rate (৳ / Plate)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Current: {mealRate}৳</span>
                  </label>
                  <input type="number" required value={rateInput} onChange={(e) => setRateInput(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
                </div>
                <button type="submit" disabled={loadingRate} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none">
                  {loadingRate ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Update Rate</>}
                </button>
              </form>
            </div>

            {/* User Management */}
            <div className="lg:col-span-8 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" /> RBAC Security Directory
                  </h3>
                  <p className="text-xs text-zinc-400">Manage user roles, status, and access levels</p>
                </div>
                <button onClick={fetchAdminData} disabled={loadingUsers} className="p-1.5 border border-zinc-800 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all cursor-pointer">
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="pb-3 pl-2">User</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {allUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pl-2">
                          <p className="font-bold text-zinc-150 flex items-center gap-1.5">
                            {usr.name}{usr.id === user.id && <span className="text-[10px] bg-zinc-800 text-zinc-200 px-1.5 rounded">Me</span>}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">{usr.email}</p>
                        </td>
                        <td className="py-3 text-xs text-zinc-400 font-mono">{usr.phone}</td>
                        <td className="py-3">
                          <select disabled={usr.id === user.id} value={usr.role} onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, e.target.value as UserRole, usr.status)}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 disabled:bg-zinc-950 disabled:text-zinc-600 cursor-pointer">
                            <option value="user">Guest</option><option value="member">Member</option><option value="manager">Manager</option><option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <select disabled={usr.id === user.id} value={usr.status} onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, usr.role, e.target.value as any)}
                            className={`px-2.5 py-1 border rounded-lg text-xs font-bold cursor-pointer ${usr.status === 'approved' ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : usr.status === 'rejected' ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-amber-500/15 border-amber-500/25 text-amber-400'}`}>
                            <option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3 text-right pr-2">
                          {usr.id === user.id ? <span className="text-[10px] text-zinc-500 font-bold uppercase">Superuser</span> : (
                            <div className="flex justify-end gap-1 text-[11px] font-bold">
                              {usr.role === 'user' && <button onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')} className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg cursor-pointer">Accept</button>}
                              {usr.role === 'member' && <button onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'manager', 'approved')} className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/25 rounded-lg cursor-pointer">Promote</button>}
                              {usr.role === 'manager' && <button onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg cursor-pointer">Demote</button>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

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
                    {info.menus.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                          <Utensils className="w-4 h-4" /> Daily Menus
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
                    {info.assignments.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" /> Bazaar Assignments
                        </h4>
                        {info.assignments.map((assignment) => (
                          <div key={assignment.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-zinc-200 text-sm">Assigned to: {assignment.userName || 'Member'}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${assignment.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' : assignment.status === 'submitted' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>{assignment.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-blue-500/20">
                                    <ImageIcon className="w-3 h-3" /> Receipt
                                  </span>
                                )}
                              </div>
                            </div>
                            {expense.receiptImage && (
                              <div className="mt-2 pt-3 border-t border-zinc-800">
                                <button onClick={() => setEnlargedReceipt(expense.receiptImage!)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer">View Full Size</button>
                                <img src={expense.receiptImage} alt="Receipt" className="w-full max-h-32 object-contain rounded-lg bg-zinc-900/70 border border-zinc-800 mt-2 cursor-pointer" onClick={() => setEnlargedReceipt(expense.receiptImage!)} />
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

    </div>
  );
}
