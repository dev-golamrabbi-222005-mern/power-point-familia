import React, { useState } from 'react';
import { User, MealMenu } from '@/src/types';
import MemberDashboard from '../MemberDashboard';
import { UserCheck, Eye, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminMemberViewTabProps {
  token: string;
  allUsers: User[];
  menus: MealMenu[];
  mealRate: number;
  onRefreshStats: () => void;
}

export default function AdminMemberViewTab({ token, allUsers, menus, mealRate, onRefreshStats }: AdminMemberViewTabProps) {
  const members = allUsers.filter(u => u.role === 'member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');

  const activeMember = members.find(m => m.id === selectedMemberId) || members[0];

  if (members.length === 0) {
    return (
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
        <h3 className="text-lg font-bold text-zinc-200">No Members Found</h3>
        <p className="text-xs text-zinc-400">There are currently no registered members in the system to view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impersonation Banner & Member Selector Sub-Tabs */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-blue-500/20 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Admin Support Mode
                </span>
                <p className="text-xs font-bold text-zinc-300">Member Inspection View</p>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Viewing dashboard as <strong className="text-emerald-400">{activeMember?.name}</strong> ({activeMember?.email})
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Sub-Tabs for Members */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-zinc-800/80 pt-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Select Member:
          </span>
          {members.map((mem) => (
            <button
              key={mem.id}
              onClick={() => setSelectedMemberId(mem.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border ${
                (activeMember?.id === mem.id)
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{mem.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render MemberDashboard for Active Member */}
      {activeMember && (
        <MemberDashboard
          key={activeMember.id}
          user={activeMember}
          token={token}
          menus={menus}
          mealRate={mealRate}
          onRefreshStats={onRefreshStats}
        />
      )}
    </div>
  );
}
