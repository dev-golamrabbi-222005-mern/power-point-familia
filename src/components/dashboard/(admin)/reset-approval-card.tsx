import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface ResetApprovalCardProps {
  month: string;
  totalBazaarExpense: number;
  totalMealsCount: number;
  finalMealRate: number;
  initiatedBy: string;
  onApprove: () => void;
  onReject: () => void;
}

export const ResetApprovalCard: React.FC<ResetApprovalCardProps> = ({
  month,
  totalBazaarExpense,
  totalMealsCount,
  finalMealRate,
  initiatedBy,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/25 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Pending Month-End Reset</span>
            <h4 className="text-lg font-bold text-zinc-100">{month} Reset Request</h4>
          </div>
        </div>
        <span className="text-xs text-zinc-400">By: {initiatedBy}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center text-xs">
        <div>
          <p className="text-zinc-500 font-bold uppercase text-[10px]">Total Bazaar</p>
          <p className="font-mono text-zinc-100 font-black text-sm">৳{totalBazaarExpense}</p>
        </div>
        <div>
          <p className="text-zinc-500 font-bold uppercase text-[10px]">Total Meals</p>
          <p className="font-mono text-zinc-100 font-black text-sm">{totalMealsCount}</p>
        </div>
        <div>
          <p className="text-zinc-500 font-bold uppercase text-[10px]">Final Rate</p>
          <p className="font-mono text-emerald-400 font-black text-sm">৳{finalMealRate}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReject}
          className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={onApprove}
          className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Approve Month-End Reset
        </button>
      </div>
    </div>
  );
};
