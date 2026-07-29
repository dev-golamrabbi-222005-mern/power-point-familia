import React from 'react';
import { TrendingUp, Calculator } from 'lucide-react';

interface LiveRateCardProps {
  rate: number;
  equationText?: string;
}

export const LiveRateCard: React.FC<LiveRateCardProps> = ({
  rate,
  equationText = 'Mess Total Verified Meal Cost / Mess Total Meals',
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/5 border border-emerald-500/20 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live Calculated Rate</span>
            <h3 className="text-3xl font-black text-zinc-100">{rate}৳</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
            <Calculator className="w-3.5 h-3.5 text-emerald-500" />
            <span>{equationText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
