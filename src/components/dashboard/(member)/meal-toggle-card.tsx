import React from 'react';
import { Utensils, Sun, Moon } from 'lucide-react';

interface MealToggleCardProps {
  date: string;
  lunchCount: number;
  dinnerCount: number;
  onToggleLunch: (count: number) => void;
  onToggleDinner: (count: number) => void;
}

export const MealToggleCard: React.FC<MealToggleCardProps> = ({
  date,
  lunchCount,
  dinnerCount,
  onToggleLunch,
  onToggleDinner,
}) => {
  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-500" />
          <h4 className="font-bold text-zinc-100 text-sm">{date}</h4>
        </div>
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Meal Booking</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lunch */}
        <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-300">Lunch</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLunch(Math.max(0, lunchCount - 1))}
              className="w-7 h-7 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-black text-zinc-100 w-4 text-center">{lunchCount}</span>
            <button
              onClick={() => onToggleLunch(lunchCount + 1)}
              className="w-7 h-7 bg-emerald-600/30 text-emerald-400 font-bold rounded-lg hover:bg-emerald-600 hover:text-white cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Dinner */}
        <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-zinc-300">Dinner</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleDinner(Math.max(0, dinnerCount - 1))}
              className="w-7 h-7 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-black text-zinc-100 w-4 text-center">{dinnerCount}</span>
            <button
              onClick={() => onToggleDinner(dinnerCount + 1)}
              className="w-7 h-7 bg-emerald-600/30 text-emerald-400 font-bold rounded-lg hover:bg-emerald-600 hover:text-white cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
