'use client';

import React, { useState } from 'react';
import { X, Clock, AlertTriangle, Send, Check } from 'lucide-react';

interface EmergencyMealRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  mealType: 'lunch' | 'dinner';
  token: string;
  onSuccess?: () => void;
}

export default function EmergencyMealRequestModal({
  isOpen,
  onClose,
  date,
  mealType,
  token,
  onSuccess,
}: EmergencyMealRequestModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the late request.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/records/request-meal-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          mealType,
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#111111] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Request Late Meal Off</h3>
              <p className="text-[11px] text-zinc-400 capitalize">
                Cutoff has passed for {mealType} ({date})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>Request submitted to manager for approval!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl text-[11px] text-zinc-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Standard meal-off cutoff was 9:00 AM (Lunch) / 3:00 PM (Dinner). Submitting this request sends an urgent notification to the manager. If accepted before cooking starts, your meal will be cancelled.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Reason for Emergency Meal Off
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Sudden office lunch invitation, outside for personal emergency..."
                className="w-full p-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-bold rounded-xl border border-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
