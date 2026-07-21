import React, { useState, useEffect } from 'react';
import { User, MealMenu, MealRecord, Deposit, DashboardStats } from '../types';
import { Coins, Utensils, Calendar, Receipt, CreditCard, Clock, FileText, CheckCircle2, AlertTriangle, Send, Plus, Minus } from 'lucide-react';

interface MemberDashboardProps {
  user: User;
  token: string;
  menus: MealMenu[];
  mealRate: number;
  onRefreshStats: () => void;
}

export default function MemberDashboard({ user, token, menus, mealRate, onRefreshStats }: MemberDashboardProps) {
  const [stats, setStats] = useState<DashboardStats['userStats'] | null>(null);
  const [myRecords, setMyRecords] = useState<MealRecord[]>([]);
  const [myDeposits, setMyDeposits] = useState<Deposit[]>([]);
  
  // Deposit Form State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depError, setDepError] = useState('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depLoading, setDepLoading] = useState(false);

  // Meal booking temporary loader
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const fetchMemberData = async () => {
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.userStats);
      }

      // 2. Fetch meal records
      const recordsRes = await fetch('/api/records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();
      if (recordsRes.ok) {
        setMyRecords(recordsData);
      }

      // 3. Fetch deposits
      const depositsRes = await fetch('/api/deposits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const depositsData = await depositsRes.json();
      if (depositsRes.ok) {
        setMyDeposits(depositsData);
      }
    } catch (error) {
      console.error('Error fetching member stats', error);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [token, menus]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepError('');
    setDepSuccess('');
    setDepLoading(true);

    if (!amount || Number(amount) <= 0) {
      setDepError('Please specify a positive deposit amount.');
      setDepLoading(false);
      return;
    }

    if (!transactionId.trim()) {
      setDepError('Please supply a valid payment transaction reference ID.');
      setDepLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          date: depositDate,
          paymentMethod,
          transactionId,
          remarks
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Deposit submission failed.');
      }

      setDepSuccess('Deposit ticket logged! Awaiting Manager authorization.');
      setAmount('');
      setTransactionId('');
      setRemarks('');
      
      // Refresh statistics & records list
      fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      setDepError(err.message || 'Network error.');
    } finally {
      setDepLoading(false);
    }
  };

  const handleUpdateBooking = async (date: string, mealType: 'lunch' | 'dinner', currentCount: number, increment: boolean) => {
    const newCount = increment ? currentCount + 1 : currentCount - 1;
    if (newCount < 0 || newCount > 5) return;

    const actionKey = `${date}-${mealType}`;
    setBookingLoading(actionKey);

    try {
      const response = await fetch('/api/records/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          mealType,
          count: newCount
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Meal booking change failed.');
      }

      // Refresh records & stats
      await fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Error updating booking');
    } finally {
      setBookingLoading(null);
    }
  };

  // Group future/current menus
  const sortedMenus = [...menus].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Quick Financial Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Balance Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Available Balance</p>
            <h3 className={`text-2xl font-black mt-1 ${stats && stats.totalBalance < 100 ? 'text-red-400 animate-pulse' : 'text-zinc-100'}`}>
              {stats ? `${stats.totalBalance}৳` : '--'}
            </h3>
            {stats && stats.totalBalance < 100 && (
              <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> Balance critical. Deposit cash!
              </span>
            )}
            {stats && stats.totalBalance >= 100 && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Account standing safe
              </span>
            )}
          </div>
          <div className={`p-3 rounded-xl ${stats && stats.totalBalance < 100 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Approved Deposits</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats ? `${stats.totalDeposits}৳` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Total cash approved in ledger</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total Meals Count Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Meals Count</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats ? `${stats.totalMealsCount} Units` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Meals consumed in system</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Meal Expense Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Expense</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats ? `${stats.totalMealCost}৳` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium mt-1 block">At fixed meal rate: {mealRate}৳</span>
          </div>
          <div className="p-3 bg-zinc-800 text-zinc-300 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Interactive Calendar Bookings & Deposit Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Meal Booking Calendar Panel */}
        <div className="lg:col-span-8 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Meal Scheduler & Calendar
              </h3>
              <p className="text-xs text-zinc-400">Book, increase, or cancel your meals for current/upcoming menus</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md font-bold">
                Rate: {mealRate}৳ / Meal
              </span>
            </div>
          </div>

          {sortedMenus.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {sortedMenus.map((menu) => {
                // Find matching booking record for this user on this date and type
                const booking = myRecords.find(r => r.date === menu.date && r.mealType === menu.mealType);
                const bookedCount = booking ? booking.count : 0;
                const actionKey = `${menu.date}-${menu.mealType}`;
                const isToday = menu.date === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={menu.id} 
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isToday 
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/15' 
                        : 'bg-[#18181b] border-zinc-800'
                    }`}
                  >
                    
                    {/* Menu details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400">
                          {new Date(menu.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`capitalize text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {menu.mealType}
                        </span>
                        {isToday && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded animate-pulse">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-500">Menu:</span>
                        {menu.items.map((item, idx) => (
                          <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg shadow-2xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Booking controllers */}
                    <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">Your Booking</p>
                        <p className="text-xs font-bold text-zinc-350">
                          {bookedCount > 0 ? `${bookedCount} Meal${bookedCount > 1 ? 's' : ''} (${bookedCount * mealRate}৳)` : 'No meal booked'}
                        </p>
                      </div>

                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 shadow-2xs">
                        <button
                          id={`btn-dec-${actionKey}`}
                          disabled={bookedCount === 0 || bookingLoading === actionKey}
                          onClick={() => handleUpdateBooking(menu.date, menu.mealType, bookedCount, false)}
                          className="p-1 hover:bg-zinc-850 rounded text-zinc-400 disabled:text-zinc-700 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-mono text-sm font-bold text-zinc-200 min-w-8 text-center">
                          {bookingLoading === actionKey ? '...' : bookedCount}
                        </span>
                        <button
                          id={`btn-inc-${actionKey}`}
                          disabled={bookedCount >= 5 || bookingLoading === actionKey}
                          onClick={() => handleUpdateBooking(menu.date, menu.mealType, bookedCount, true)}
                          className="p-1 hover:bg-zinc-850 rounded text-zinc-400 disabled:text-zinc-700 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-350 font-semibold text-sm">No meal menus are published yet</p>
              <p className="text-zinc-500 text-xs mt-1">Check back later when the system Manager uploads the menus.</p>
            </div>
          )}
        </div>

        {/* Deposit request submission form */}
        <div className="lg:col-span-4 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              Submit Deposit Ticket
            </h3>
            <p className="text-xs text-zinc-400">Log payments to top-up your balance</p>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {depError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{depError}</span>
              </div>
            )}
            {depSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{depSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Amount (Taka)
              </label>
              <input
                id="dep-amount"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Method
                </label>
                <select
                  id="dep-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="bKash">bKash</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Cash">Hand Cash</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Deposit Date
                </label>
                <input
                  id="dep-date"
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Transaction ID / Ref
              </label>
              <input
                id="dep-trx"
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TRX102948"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Remarks / Reference Note
              </label>
              <textarea
                id="dep-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Deposited for July meals"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <button
              id="btn-submit-deposit"
              type="submit"
              disabled={depLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              {depLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Deposit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* 3. Deposit ledger tracking statement history */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-zinc-800 pb-4 mb-5">
          <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Your Deposit History & Slips
          </h3>
          <p className="text-xs text-zinc-400">Track all cash inputs and authorization statuses in the system ledger</p>
        </div>

        {myDeposits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Reference Trx</th>
                  <th className="pb-3">Payment Gateway</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pl-4">Note / Remarks</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {myDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-zinc-900/35">
                    <td className="py-3.5 pl-2 font-medium text-zinc-350 font-sans">
                      {new Date(dep.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-zinc-200 font-semibold">{dep.transactionId}</td>
                    <td className="py-3.5">
                      <span className="bg-zinc-850 text-zinc-300 font-bold px-2 py-0.5 rounded text-xs">
                        {dep.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-zinc-100">{dep.amount}৳</td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400 max-w-[200px] truncate" title={dep.remarks}>
                      {dep.remarks || '--'}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        dep.status === 'approved' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : dep.status === 'rejected' 
                          ? 'bg-red-500/15 text-red-400' 
                          : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dep.status === 'approved' 
                            ? 'bg-emerald-500' 
                            : dep.status === 'rejected' 
                            ? 'bg-red-500' 
                            : 'bg-amber-500 animate-pulse'
                        }`} />
                        <span className="capitalize">{dep.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm font-semibold">No deposits logged yet</p>
            <p className="text-xs text-zinc-500 mt-1">Top-up your wallet using the submission form on the right.</p>
          </div>
        )}
      </div>

    </div>
  );
}
