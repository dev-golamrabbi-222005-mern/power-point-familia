'use client';

import React, { useState } from 'react';
import { CheckCircle2, DollarSign, ArrowDownRight, ArrowUpRight, Receipt, AlertCircle } from 'lucide-react';
import { BazaarExpense } from '@/src/types';

interface BazaarReconciliationProps {
  expense: BazaarExpense;
  token: string;
  onVerified?: () => void;
}

export default function BazaarReconciliationCard({ expense, token, onVerified }: BazaarReconciliationProps) {
  const [allocatedCash, setAllocatedCash] = useState<number>(expense.allocatedCash || 1500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSpent = expense.totalCost || 0;
  const returnedCash = Math.max(0, allocatedCash - totalSpent);
  const extraSpent = Math.max(0, totalSpent - allocatedCash);

  const handleVerify = async (status: 'approved' | 'rejected') => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/bazaar/expense/${expense.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          allocatedCash,
          returnedCash,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      if (onVerified) onVerified();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Submitter Info */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-zinc-100">{expense.userName || 'Assigned Shopper'}</p>
            <p className="text-[10px] text-zinc-400 font-mono">Date: {expense.date} • {expense.items?.length || 0} items</p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
          Awaiting Manager Handover
        </span>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Items Summary */}
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {expense.items?.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 bg-zinc-950/60 rounded-xl border border-zinc-900">
            <span className="text-zinc-300 font-medium">
              {item.name} {item.qty && <span className="text-[10px] text-zinc-500 font-mono">({item.qty})</span>}
              {item.isExtra && <span className="text-[9px] text-amber-400 font-mono ml-1.5 bg-amber-400/10 px-1 rounded">Extra</span>}
            </span>
            <span className="text-emerald-400 font-bold">৳{item.cost}</span>
          </div>
        ))}
      </div>

      {/* Handover Reconciliation Matrix */}
      <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-2xl grid grid-cols-3 gap-2 text-center">
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase">Manager Gave</label>
          <div className="relative mt-0.5">
            <input
              type="number"
              value={allocatedCash}
              onChange={(e) => setAllocatedCash(Number(e.target.value) || 0)}
              className="w-full text-center text-xs font-bold bg-zinc-900 border border-zinc-800 rounded-lg py-1 text-zinc-200"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase">Actual Spent</label>
          <p className="text-xs font-black text-emerald-400 mt-1.5">৳{totalSpent}</p>
        </div>

        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase">
            {returnedCash > 0 ? 'Member Returns' : 'Mess Owes'}
          </label>
          <p className={`text-xs font-black mt-1.5 flex items-center justify-center gap-0.5 ${returnedCash > 0 ? 'text-teal-400' : 'text-amber-400'}`}>
            {returnedCash > 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            ৳{returnedCash > 0 ? returnedCash : extraSpent}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleVerify('approved')}
          disabled={loading}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Verify & Approve Bazaar'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleVerify('rejected')}
          disabled={loading}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
