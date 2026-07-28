import React, { useState } from 'react';
import { User, MealMenu } from '@/src/types';
import ManagerDashboard from '../ManagerDashboard';
import { ShieldCheck, Eye, ChefHat, AlertCircle } from 'lucide-react';

interface AdminManagerViewTabProps {
  token: string;
  allUsers: User[];
  menus: MealMenu[];
  mealRate: number;
  onRefreshMenus: () => void;
}

export default function AdminManagerViewTab({ token, allUsers, menus, mealRate, onRefreshMenus }: AdminManagerViewTabProps) {
  const managers = allUsers.filter(u => u.role === 'manager');
  const [selectedManagerId, setSelectedManagerId] = useState<string>(managers[0]?.id || '');

  const activeManager = managers.find(m => m.id === selectedManagerId) || managers[0];

  if (managers.length === 0) {
    return (
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-200">No Managers Appointed</h3>
        <p className="text-xs text-zinc-400">There are currently no users with the Manager role in the system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impersonation Banner & Manager Selector Sub-Tabs */}
      <div className="bg-gradient-to-r from-purple-600/10 via-indigo-600/5 to-emerald-600/10 border border-purple-500/20 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  Admin Audit Mode
                </span>
                <p className="text-xs font-bold text-zinc-300">Manager Inspection View</p>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Viewing Manager Workspace as <strong className="text-purple-400">{activeManager?.name}</strong> ({activeManager?.email})
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Sub-Tabs for Managers */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-zinc-800/80 pt-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Select Manager:
          </span>
          {managers.map((mgr) => (
            <button
              key={mgr.id}
              onClick={() => setSelectedManagerId(mgr.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                (activeManager?.id === mgr.id)
                  ? 'bg-purple-500 text-white border-purple-400 shadow-md font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{mgr.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render ManagerDashboard for Active Manager */}
      {activeManager && (
        <ManagerDashboard
          key={activeManager.id}
          user={activeManager}
          token={token}
          menus={menus}
          mealRate={mealRate}
          onRefreshMenus={onRefreshMenus}
        />
      )}
    </div>
  );
}
