import React, { useState, useEffect } from 'react';
import { User, MonthlySummary, AdminChangeRequest } from '@/src/types';
import { ShieldCheck, CheckCircle2, Sliders, Save, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface AdminPermissionsTabProps {
  token: string;
  mealRate: number;
  onRefreshSettings: () => void;
}

export default function AdminPermissionsTab({ token, mealRate, onRefreshSettings }: AdminPermissionsTabProps) {
  const [rateInput, setRateInput] = useState(mealRate.toString());
  const [autoBookEnabled, setAutoBookEnabled] = useState(true);
  const [autoBookLoading, setAutoBookLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);

  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [changeRequests, setChangeRequests] = useState<AdminChangeRequest[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPermissionsData = async () => {
    try {
      const settingsRes = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setAutoBookEnabled(sData.autoBookMeals ?? true);
      }

      const monthRes = await fetch('/api/month-end', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (monthRes.ok) setMonthlySummaries(await monthRes.json());

      const reqRes = await fetch('/api/admin/change-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqRes.ok) setChangeRequests(await reqRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPermissionsData();
  }, [token]);

  useEffect(() => {
    setRateInput(mealRate.toString());
  }, [mealRate]);

  const handleToggleAutoBook = async () => {
    setAutoBookLoading(true);
    try {
      const res = await fetch('/api/settings/auto-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ autoBookMeals: !autoBookEnabled })
      });
      const data = await res.json();
      if (res.ok) {
        setAutoBookEnabled(data.autoBookMeals);
        onRefreshSettings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAutoBookLoading(false);
    }
  };

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
          Authorization: `Bearer ${token}`
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

  const handleProcessChangeRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/change-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPermissionsData();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMonthEnd = async (summaryId: string, action: 'approve' | 'reject') => {
    if (action === 'approve' && !window.confirm('Are you sure you want to approve and archive this month-end reset? This will clear active daily meals/expenses and carry forward member ending balances.')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/month-end', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ summaryId, action })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPermissionsData();
      } else {
        alert(data.message || 'Action failed.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = changeRequests.filter(r => r.status === 'pending');
  const pendingMonthEnds = monthlySummaries.filter(s => s.status === 'pending_approval');

  return (
    <div className="space-y-6">
      {/* Global System Variables & Auto-Book Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Auto Meal Booking Switch */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-zinc-100">Global Auto Meal Booking</h3>
                <p className="text-xs text-zinc-400">Automatically book 1 meal daily for all active members</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={handleToggleAutoBook}
              disabled={autoBookLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 cursor-pointer focus:outline-none disabled:opacity-50 ${
                autoBookEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                autoBookEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
            Status: <strong className={autoBookEnabled ? 'text-emerald-400' : 'text-amber-400'}>{autoBookEnabled ? 'Enabled' : 'Disabled'}</strong>. When enabled, all verified members receive 1 automatic meal entry every morning unless manually opted out.
          </div>
        </div>

        {/* Live Meal Rate Display (Auto Generated) */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-100">Live Meal Rate (Auto Calculated)</h3>
              <p className="text-xs text-zinc-400">Formula: Mess Verified Bajar Expenses / Total Mess Meals</p>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Live Rate</p>
              <p className="text-2xl font-black text-purple-400 mt-1">৳{mealRate} <span className="text-xs text-zinc-400 font-normal">/ plate</span></p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-purple-500/15 text-purple-300 rounded-lg border border-purple-500/20">
              Automated
            </span>
          </div>
        </div>
      </div>

      {/* Pending Manager Significant Change Requests */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Manager Significant Change Requests ({pendingRequests.length})
          </h3>
          <button onClick={fetchPermissionsData} className="p-1.5 text-zinc-400 hover:text-zinc-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800/80">
            <p className="text-xs text-zinc-500 font-medium">No pending significant change requests from Managers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded uppercase">
                      {req.type}
                    </span>
                    <p className="text-sm font-bold text-zinc-100">{req.details}</p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Requested by Manager <strong className="text-purple-400">{req.managerName}</strong> for Member <strong className="text-emerald-400">{req.targetUserName}</strong>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleProcessChangeRequest(req.id, 'rejected')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-red-500/15 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/25 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleProcessChangeRequest(req.id, 'approved')}
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-emerald-500 text-zinc-950 text-xs font-black rounded-lg hover:bg-emerald-400 cursor-pointer shadow-md"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Month-End Reset Requests */}
      {pendingMonthEnds.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-purple-600/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100">Pending Month-End Reset Approvals</h3>
              <p className="text-xs text-zinc-400">Review final calculations before archiving the month</p>
            </div>
          </div>

          {pendingMonthEnds.map(summary => (
            <div key={summary.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                <span>Month: {summary.month}</span>
                <span>Total Bazaar: {summary.totalBazaarExpense}৳</span>
                <span>Total Meals: {summary.totalMealsCount} Plates</span>
                <span className="text-emerald-400">Final Meal Rate: {summary.finalMealRate}৳</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleApproveMonthEnd(summary.id, 'reject')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500/15 text-red-400 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproveMonthEnd(summary.id, 'approve')}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-500 text-zinc-950 text-xs font-black rounded-lg cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
