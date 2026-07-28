import React, { useState } from 'react';
import { User, UserRole } from '@/src/types';
import { Users, Search, RefreshCw, Edit3, Trash2, X, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdminUserDirectoryTabProps {
  currentUser: User;
  token: string;
  allUsers: User[];
  loadingUsers: boolean;
  onRefreshData: () => void;
}

export default function AdminUserDirectoryTab({ currentUser, token, allUsers, loadingUsers, onRefreshData }: AdminUserDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editStatus, setEditStatus] = useState<User['status']>('approved');
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (usr: User) => {
    setEditingUser(usr);
    setEditName(usr.name || '');
    setEditEmail(usr.email || '');
    setEditPhone(usr.phone || '');
    setEditRole(usr.role);
    setEditStatus(usr.status);
  };

  const handleSaveFullUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/members/${editingUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          role: editRole,
          status: editStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user profile');

      setEditingUser(null);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error updating user profile');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (usr: User) => {
    if (usr.id === currentUser.id) {
      alert('You cannot delete your own superuser account!');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${usr.name}" (${usr.email})? This action cannot be undone!`)) {
      return;
    }

    setUpdatingId(usr.id);
    try {
      const res = await fetch(`/api/members/${usr.id}/role`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateUserRoleAndStatus = async (targetId: string, newRole: UserRole, newStatus: User['status']) => {
    if (targetId === currentUser.id) {
      alert('You cannot modify your own superuser role!');
      return;
    }
    setUpdatingId(targetId);
    try {
      const response = await fetch(`/api/members/${targetId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole, status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update.');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error updating user.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone && u.phone.includes(searchQuery));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" /> User Directory & Access Control
          </h3>
          <p className="text-xs text-zinc-400">Admin A-Z control panel for editing user details, status, ban, and deletion</p>
        </div>
        <button
          onClick={onRefreshData}
          disabled={loadingUsers}
          className="p-2 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-bold">Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Guests (Pending)</option>
            <option value="member">Members</option>
            <option value="manager">Managers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-zinc-800/80 rounded-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-400 font-mono text-[10px] uppercase tracking-wider z-10">
            <tr className="border-b border-zinc-800">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredUsers.map((usr) => (
              <tr key={usr.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-zinc-100 flex items-center gap-2">
                    {usr.name}
                    {usr.id === currentUser.id && (
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase">
                        Superuser (Me)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">{usr.email}</p>
                </td>
                <td className="py-3 px-3 text-xs text-zinc-400 font-mono">{usr.phone || 'N/A'}</td>
                <td className="py-3 px-3">
                  <select
                    disabled={usr.id === currentUser.id || updatingId === usr.id}
                    value={usr.role}
                    onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, e.target.value as UserRole, usr.status)}
                    className="px-2.5 py-1 bg-zinc-900 border border-zinc-700/60 rounded-lg text-xs font-bold text-zinc-200 disabled:opacity-50 cursor-pointer"
                  >
                    <option value="user">Guest</option>
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-3">
                  <select
                    disabled={usr.id === currentUser.id || updatingId === usr.id}
                    value={usr.status}
                    onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, usr.role, e.target.value as any)}
                    className={`px-2.5 py-1 border rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 ${
                      usr.status === 'approved'
                        ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                        : usr.status === 'rejected'
                        ? 'bg-red-500/15 border-red-500/25 text-red-400'
                        : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                    }`}
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected / Inactive</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  {usr.id === currentUser.id ? (
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Superuser</span>
                  ) : (
                    <div className="flex justify-end gap-1.5 text-[11px] font-bold">
                      <button
                        onClick={() => openEditModal(usr)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                        title="A-Z Full Profile Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {usr.role === 'user' && (
                        <button
                          onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')}
                          className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 rounded-lg cursor-pointer transition-all"
                        >
                          Accept
                        </button>
                      )}
                      {usr.role === 'member' && (
                        <button
                          onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'manager', 'approved')}
                          className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/25 rounded-lg cursor-pointer transition-all"
                        >
                          Promote to Manager
                        </button>
                      )}
                      {usr.role === 'manager' && (
                        <button
                          onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg cursor-pointer transition-all"
                        >
                          Demote to Member
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(usr)}
                        disabled={updatingId === usr.id}
                        className="px-2 py-1 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-lg cursor-pointer transition-all flex items-center justify-center disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FULL A-Z USER EDITING MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-[#0f0f0f]">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" /> Full A-Z Profile Edit
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullUserEdit} className="p-6 space-y-4">
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
                  onClick={() => setEditingUser(null)}
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
      )}
    </div>
  );
}
