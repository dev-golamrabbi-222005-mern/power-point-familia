'use client';

import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  ChefHat, 
  Calendar, 
  Clock, 
  X, 
  Check, 
  AlertTriangle, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  TrendingUp, 
  Users, 
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { BazaarAssignment, BazaarExpense, MealMenu, User, BazaarPair } from '@/src/types';

interface ManagerMealsTabProps {
  token: string;
  menus: MealMenu[];
  onRefreshMenus: () => void;
  onError?: (msg: string) => void;
}

export default function ManagerMealsTab({ token, menus, onRefreshMenus, onError }: ManagerMealsTabProps) {
  const [loading, setLoading] = useState(true);
  
  // KPI state
  const [mealKpis, setMealKpis] = useState({
    todayTotal: 0,
    todayLunch: 0,
    todayDinner: 0,
    weekTotal: 0,
    monthTotal: 0,
    totalMealCashCollected: 0,
    totalBazaarSpent: 0,
    liveMealRate: 45,
  });

  // Bazaar state
  const [assignments, setAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [expenses, setExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [pairs, setPairs] = useState<BazaarPair[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);

  // Force cancel modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelMealType, setCancelMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState('');

  // Assign Bazaar Form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignMember2Id, setAssignMember2Id] = useState('');
  const [assignBudget, setAssignBudget] = useState('');
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignShoppingList, setAssignShoppingList] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Enlarged receipt modal
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);

  const fetchMealsData = async () => {
    try {
      setLoading(true);
      const [membersRes, assignRes, expRes, pairsRes, statsRes, recordsRes] = await Promise.all([
        fetch('/api/members', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bazaar/assign', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bazaar/expense', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bazaar/pairs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/records', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (membersRes.ok) setMembers(await membersRes.json());
      if (assignRes.ok) setAssignments(await assignRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      
      if (pairsRes.ok) {
        const pairData = await pairsRes.json();
        setPairs(pairData.pairs || []);
        setCurrentPairIndex(pairData.currentPairIndex || 0);
      }

      if (recordsRes.ok && statsRes.ok) {
        const records: any[] = await recordsRes.json();
        const stats = await statsRes.json();
        const mStats = stats.managerStats;

        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r => r.date === today);

        const todayLunch = todayRecords.filter(r => r.mealType === 'lunch').reduce((s, r) => s + (r.count || 0), 0);
        const todayDinner = todayRecords.filter(r => r.mealType === 'dinner').reduce((s, r) => s + (r.count || 0), 0);

        const currentMonth = today.slice(0, 7);
        const monthRecords = records.filter(r => r.date && r.date.startsWith(currentMonth));
        const monthTotal = monthRecords.reduce((s, r) => s + (r.count || 0), 0);

        setMealKpis({
          todayTotal: todayLunch + todayDinner,
          todayLunch,
          todayDinner,
          weekTotal: Math.round(monthTotal / 4),
          monthTotal,
          totalMealCashCollected: mStats?.totalSystemDeposits || 0,
          totalBazaarSpent: mStats?.totalBazaarExpenses || 0,
          liveMealRate: mStats?.liveMealRate || 45,
        });
      }
    } catch (err) {
      console.error('Error fetching meals tab data', err);
      onError?.('Failed to load meals data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealsData();
  }, [token]);

  const handleForceCancelToday = async () => {
    try {
      setCancelling(true);
      const res = await fetch('/api/records/force-cancel-today', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mealType: cancelMealType }),
      });

      if (!res.ok) throw new Error('Force cancel failed');
      const data = await res.json();
      setCancelSuccess(data.message || 'Cancelled successfully');
      setTimeout(() => {
        setIsCancelModalOpen(false);
        setCancelSuccess('');
        fetchMealsData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Force cancel error');
    } finally {
      setCancelling(false);
    }
  };

  const handleAssignBazaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId || !assignDate) {
      alert('Select primary member and date');
      return;
    }

    try {
      setAssigning(true);
      const res = await fetch('/api/bazaar/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: assignUserId,
          member2Id: assignMember2Id || undefined,
          budget: Number(assignBudget || 0),
          date: assignDate,
          shoppingList: assignShoppingList.split(',').map(i => i.trim()).filter(i => i),
        }),
      });

      if (!res.ok) throw new Error('Bazaar assignment failed');
      setShowAssignForm(false);
      setAssignShoppingList('');
      setAssignBudget('');
      setAssignMember2Id('');
      fetchMealsData();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleExpenseStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/bazaar/expense/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      fetchMealsData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-400">Loading Meals & Bazaar Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === KPIS HEADER GRID === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Total Meals with Breakdown */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:to-zinc-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Total Meals Today
            </p>
            <ChefHat className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {mealKpis.todayTotal} <span className="text-xs font-normal text-zinc-400">meals</span>
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <span>Lunch: <strong className="font-extrabold">{mealKpis.todayLunch}</strong></span>
            <span>Dinner: <strong className="font-extrabold">{mealKpis.todayDinner}</strong></span>
          </div>
        </div>

        {/* KPI 2: Week & Month Meals */}
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/30 dark:to-zinc-900 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Month & Week Meals
            </p>
            <Utensils className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {mealKpis.monthTotal} <span className="text-xs font-normal text-zinc-400">this month</span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold mt-1">
            ~{mealKpis.weekTotal} meals / week
          </p>
        </div>

        {/* KPI 3: Total Meal Cash Metrics */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 dark:to-zinc-900 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Live Meal Rate & Spent
            </p>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white">
            ৳{mealKpis.liveMealRate} <span className="text-xs font-normal text-zinc-400">/ meal</span>
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold mt-1">
            Bazaar Spent: ৳{mealKpis.totalBazaarSpent}
          </p>
        </div>

        {/* KPI 4: Force Cancel Action Card */}
        <div className="bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent dark:from-red-950/30 dark:to-zinc-900 p-4 rounded-xl border border-red-200 dark:border-red-800/60 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300 mb-1">
              Emergency Meal Control
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Force cancel today's meals for mess
            </p>
          </div>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Force Cancel Today's Meals</span>
          </button>
        </div>
      </div>

      {/* === BAZAAR ASSIGNMENT & PAIRING SECTION === */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Bazaar Assignment & Rotation Pairing
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Assign bazaar duty to members with requested shopping list and budget
            </p>
          </div>
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Bazaar Duty</span>
          </button>
        </div>

        {/* Assign Form */}
        {showAssignForm && (
          <form onSubmit={handleAssignBazaar} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Member 1 (Primary)
                </label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  <option value="">-- Choose Member 1 --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Member 2 (Partner - Optional)
                </label>
                <select
                  value={assignMember2Id}
                  onChange={(e) => setAssignMember2Id(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  <option value="">-- Choose Member 2 --</option>
                  {members.filter(m => m.id !== assignUserId).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Date of Bazaar
                </label>
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Assigned Budget (৳)
                </label>
                <input
                  type="number"
                  value={assignBudget}
                  onChange={(e) => setAssignBudget(e.target.value)}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Requested Shopping List (Comma separated)
              </label>
              <input
                type="text"
                value={assignShoppingList}
                onChange={(e) => setAssignShoppingList(e.target.value)}
                placeholder="e.g. Chicken 2kg, Rice 5kg, Oil 1L, Vegetables"
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Save Double Member Bazaar Assignment'}
            </button>
          </form>
        )}

        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold">
                <th className="p-3">Assigned Members</th>
                <th className="p-3">Date</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Shopping List</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-400 text-xs">
                    No bazaar assignments scheduled.
                  </td>
                </tr>
              ) : (
                assignments.slice(0, 10).map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">
                      {a.userName || 'Member 1'}
                      {a.member2Name && <span className="text-orange-500 font-bold"> & {a.member2Name}</span>}
                    </td>
                    <td className="p-3 font-medium text-zinc-600 dark:text-zinc-400">{a.date}</td>
                    <td className="p-3 font-extrabold text-amber-500">৳{a.budget || 0}</td>
                    <td className="p-3 text-xs text-zinc-500 max-w-[200px] truncate">
                      {a.shoppingList?.join(', ') || '--'}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === BAZAAR EXPENSE VERIFICATION SECTION === */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Bazaar Purchase Expense Validation
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Verify submitted purchase expenses and receipts (Approving deducts from Mess Cash in hand)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold">
                <th className="p-3">Member</th>
                <th className="p-3">Date</th>
                <th className="p-3">Items Purchased</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Receipt</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-zinc-400 text-xs">
                    No bazaar purchase expenses submitted yet.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">{exp.userName || 'Member'}</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">{exp.date}</td>
                    <td className="p-3 text-xs text-zinc-500 max-w-[200px] truncate">
                      {exp.items?.map(i => `${i.name} (৳${i.cost})`).join(', ') || '--'}
                    </td>
                    <td className="p-3 font-extrabold text-zinc-900 dark:text-white">৳{exp.totalCost}</td>
                    <td className="p-3">
                      {exp.receiptImage ? (
                        <button
                          onClick={() => setEnlargedReceipt(exp.receiptImage!)}
                          className="p-1 text-emerald-600 hover:text-emerald-500 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400">No Image</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : exp.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {exp.status === 'pending' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleExpenseStatus(exp.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            title="Accept Bajar & Deduct from Mess Cash"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Bajar</span>
                          </button>
                          <button
                            onClick={() => handleExpenseStatus(exp.id, 'rejected')}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all cursor-pointer"
                            title="Reject Expense"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono capitalize">{exp.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORCE CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Force Cancel Today's Meals
              </h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-sm rounded-xl">
                {cancelSuccess}
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select which meals to cancel for all members today:
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border cursor-pointer text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="radio"
                      name="cancelType"
                      value="both"
                      checked={cancelMealType === 'both'}
                      onChange={() => setCancelMealType('both')}
                    />
                    Cancel Both Lunch & Dinner
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border cursor-pointer text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="radio"
                      name="cancelType"
                      value="lunch"
                      checked={cancelMealType === 'lunch'}
                      onChange={() => setCancelMealType('lunch')}
                    />
                    Cancel Lunch Only
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border cursor-pointer text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="radio"
                      name="cancelType"
                      value="dinner"
                      checked={cancelMealType === 'dinner'}
                      onChange={() => setCancelMealType('dinner')}
                    />
                    Cancel Dinner Only
                  </label>
                </div>

                <button
                  onClick={handleForceCancelToday}
                  disabled={cancelling}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Force Cancel'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ENLARGED RECEIPT MODAL */}
      {enlargedReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEnlargedReceipt(null)}>
          <div className="max-w-xl w-full bg-zinc-900 p-2 rounded-2xl border border-zinc-700 relative">
            <button onClick={() => setEnlargedReceipt(null)} className="absolute top-4 right-4 p-1.5 bg-black/60 text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
            <img src={enlargedReceipt} alt="Purchase receipt" className="max-h-[80vh] mx-auto rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
