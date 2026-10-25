'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/src/context/DashboardContext';
import { UserCheck, X, Check, AlertCircle, RefreshCw, Users, Shield } from 'lucide-react';

export default function QuickApproveModal() {
  const { token, allUsers, isQuickApproveOpen, setIsQuickApproveOpen, refreshAll } = useDashboard();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isQuickApproveOpen) return null;

  const pendingUsers = allUsers.filter(u => u.status === 'pending');

  const handleApprove = async (userId: string, userName: string) => {
    if (!token) return;
    setApprovingId(userId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'member',
          status: 'approved',
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Approved ${userName} as Member!`);
        refreshAll();
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Approval failed');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-100">
                Quick Member Approvals
              </h3>
              <p className="text-xs text-zinc-400">
                Grant approved status to pending joining requests
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickApproveOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status alerts */}
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

        {/* Content */}
        <div className="mt-5 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-zinc-300">All Caught Up!</p>
              <p className="text-xs text-zinc-500">There are no pending registrations awaiting approval.</p>
            </div>
          ) : (
            pendingUsers.map(u => (
              <div
                key={u.id}
                className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-zinc-100 truncate">{u.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{u.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(u.id, u.name)}
                  disabled={approvingId === u.id}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {approvingId === u.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Approve</span>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex justify-end">
          <button
            onClick={() => setIsQuickApproveOpen(false)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
