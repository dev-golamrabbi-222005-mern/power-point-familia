import React from 'react';
import { X, Receipt } from 'lucide-react';
import { User as UserType } from '@/src/types';

interface ManagerFixedCostsModalProps {
  user: UserType | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  assignRent: string;
  setAssignRent: (v: string) => void;
  assignElectricity: string;
  setAssignElectricity: (v: string) => void;
  assignWifi: string;
  setAssignWifi: (v: string) => void;
  assignGas: string;
  setAssignGas: (v: string) => void;
  assignServant: string;
  setAssignServant: (v: string) => void;
  assignPastDue: string;
  setAssignPastDue: (v: string) => void;
  assigningFixed: boolean;
}

export const ManagerFixedCostsModal: React.FC<ManagerFixedCostsModalProps> = ({
  user,
  onClose,
  onSubmit,
  assignRent,
  setAssignRent,
  assignElectricity,
  setAssignElectricity,
  assignWifi,
  setAssignWifi,
  assignGas,
  setAssignGas,
  assignServant,
  setAssignServant,
  assignPastDue,
  setAssignPastDue,
  assigningFixed,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Assign Fixed Costs & Due</h3>
            <p className="text-xs text-zinc-400">For member: <span className="text-emerald-400 font-bold">{user.name}</span></p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">House Rent (৳)</label>
              <input
                type="number"
                value={assignRent}
                onChange={(e) => setAssignRent(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Electricity (৳)</label>
              <input
                type="number"
                value={assignElectricity}
                onChange={(e) => setAssignElectricity(e.target.value)}
                placeholder="e.g. 400"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Wi-Fi Bill (৳)</label>
              <input
                type="number"
                value={assignWifi}
                onChange={(e) => setAssignWifi(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Gas / Utility (৳)</label>
              <input
                type="number"
                value={assignGas}
                onChange={(e) => setAssignGas(e.target.value)}
                placeholder="e.g. 300"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Cook / Servant (৳)</label>
              <input
                type="number"
                value={assignServant}
                onChange={(e) => setAssignServant(e.target.value)}
                placeholder="e.g. 800"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Past Month Due (৳)</label>
              <input
                type="number"
                value={assignPastDue}
                onChange={(e) => setAssignPastDue(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigningFixed}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {assigningFixed ? 'Assigning...' : 'Save & Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
