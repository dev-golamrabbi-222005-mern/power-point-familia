import React from 'react';
import { Edit3, X, Save } from 'lucide-react';
import { User, UserRole } from '@/src/types';

interface AdminEditUserModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editName: string;
  setEditName: (v: string) => void;
  editEmail: string;
  setEditEmail: (v: string) => void;
  editPhone: string;
  setEditPhone: (v: string) => void;
  editRole: UserRole;
  setEditRole: (v: UserRole) => void;
  editStatus: User['status'];
  setEditStatus: (v: User['status']) => void;
  savingEdit: boolean;
}

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  user,
  onClose,
  onSubmit,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editRole,
  setEditRole,
  editStatus,
  setEditStatus,
  savingEdit,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-[#0f0f0f]">
          <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-500" /> Full A-Z Profile Edit
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="e.g. +8801700000000"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                System Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 cursor-pointer"
              >
                <option value="user">Guest</option>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Account Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as User['status'])}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 cursor-pointer"
              >
                <option value="approved">Approved / Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Inactive / Banned</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingEdit ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
