'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/src/context/DashboardContext';
import { ShoppingBag, X, DollarSign, Calendar, FileText, Check, AlertCircle } from 'lucide-react';

export default function QuickExpenseModal() {
  const { token, isQuickExpenseOpen, setIsQuickExpenseOpen, refreshAll } = useDashboard();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isQuickExpenseOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const parsedCost = parseFloat(totalCost);
      if (isNaN(parsedCost) || parsedCost <= 0) {
        throw new Error('Please enter a valid expense cost in ৳');
      }

      const res = await fetch('/api/bazaar/expense', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          items: items.trim() ? items.split(',').map(s => s.trim()) : ['Bazaar items'],
          totalCost: parsedCost,
          remarks: remarks.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Bazaar expense successfully recorded!');
        setItems('');
        setTotalCost('');
        setRemarks('');
        refreshAll();
        setTimeout(() => {
          setIsQuickExpenseOpen(false);
        }, 1200);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || 'Failed to record expense');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-zinc-100">
                Quick Bazaar / Expense Entry
              </h3>
              <p className="text-xs text-zinc-400">
                Log daily shopping or mess expenditure
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickExpenseOpen(false)}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              Expense Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              Total Amount (৳ BDT)
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              placeholder="e.g. 1250"
              value={totalCost}
              onChange={e => setTotalCost(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-teal-400" />
              Items Purchased (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Chicken 2kg, Rice 5kg, Oil, Vegetables"
              value={items}
              onChange={e => setItems(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Purchased from Karwan Bazaar"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsQuickExpenseOpen(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
