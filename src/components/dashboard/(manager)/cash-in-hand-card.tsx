import React from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface CashInHandCardProps {
  cashInHand: number;
  totalMealCashAdded: number;
  totalBazaarSpent: number;
}

export const CashInHandCard: React.FC<CashInHandCardProps> = ({
  cashInHand,
  totalMealCashAdded,
  totalBazaarSpent,
}) => {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Manager Cash In Hand</span>
            <h3 className="text-2xl font-black text-emerald-400">৳{cashInHand}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <ArrowDownRight className="w-4 h-4 text-emerald-500" />
          <span>Collected: ৳{totalMealCashAdded}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <ArrowUpRight className="w-4 h-4 text-amber-500" />
          <span>Spent: ৳{totalBazaarSpent}</span>
        </div>
      </div>
    </div>
  );
};
