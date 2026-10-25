'use client';

import React, { useState } from 'react';
import { Clock, AlertTriangle, Check, X } from 'lucide-react';

interface EmergencyRequestItem {
  id: string;
  userName: string;
  mealType: string;
  date: string;
  requestReason?: string;
  requestedAt?: string;
}

interface EmergencyMealRequestCardProps {
  request: EmergencyRequestItem;
  token: string;
  onResolved?: () => void;
}

export default function EmergencyMealRequestCard({
  request,
  token,
  onResolved,
}: EmergencyMealRequestCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action: 'accept' | 'reject') => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/records/request-meal-off', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recordId: request.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      if (onResolved) onResolved();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-zinc-950/80 border border-amber-500/30 rounded-2xl space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100">{request.userName}</p>
            <p className="text-[10px] text-zinc-400 capitalize">
              Late Request: <span className="text-amber-400 font-semibold">{request.mealType}</span> ({request.date})
            </p>
          </div>
        </div>
        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
          Pending
        </span>
      </div>

      {request.requestReason && (
        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 italic">
          "{request.requestReason}"
        </div>
      )}

      {error && <p className="text-[10px] text-red-400 font-semibold">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleAction('accept')}
          disabled={loading}
          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black rounded-lg transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept (Turn Off)</span>
        </button>
        <button
          type="button"
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
