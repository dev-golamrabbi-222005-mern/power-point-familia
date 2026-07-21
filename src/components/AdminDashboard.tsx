import React, { useState, useEffect } from 'react';
import { User, UserRole, SystemSettings } from '../types';
import { ShieldAlert, Users, Coins, ShieldCheck, CheckCircle2, Sliders, Save, RefreshCw, AlertCircle, Trash2, Heart } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  token: string;
  mealRate: number;
  onRefreshSettings: () => void;
}

export default function AdminDashboard({ user, token, mealRate, onRefreshSettings }: AdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rateInput, setRateInput] = useState(mealRate.toString());
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      // 1. Fetch system users
      const usersRes = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setAllUsers(usersData);
      }
    } catch (error) {
      console.error('Error in admin fetch', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  useEffect(() => {
    setRateInput(mealRate.toString());
  }, [mealRate]);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    setLoadingRate(true);

    if (Number(rateInput) <= 0) {
      setSettingsError('Meal rate must be a positive value.');
      setLoadingRate(false);
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mealRate: Number(rateInput) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update system meal rate.');
      }

      setSettingsSuccess('Meal rate settings saved globally!');
      onRefreshSettings();
    } catch (err: any) {
      setSettingsError(err.message || 'Error occurred.');
    } finally {
      setLoadingRate(false);
    }
  };

  const handleUpdateUserRoleAndStatus = async (targetId: string, newRole: UserRole, newStatus: User['status']) => {
    if (targetId === user.id) {
      alert('You cannot modify your own administrative roles or statuses!');
      return;
    }

    try {
      const response = await fetch(`/api/members/${targetId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role: newRole,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user security tier.');
      }

      // Refresh roster list
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Error updating user.');
    }
  };

  // Counting status aggregates for Admin Overview cards
  const totalRegistrations = allUsers.length;
  const pendingRegistrations = allUsers.filter(u => u.status === 'pending').length;
  const managersCount = allUsers.filter(u => u.role === 'manager').length;
  const approvedMembers = allUsers.filter(u => u.role === 'member' && u.status === 'approved').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Admin Aggregates Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Registered Accounts</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {totalRegistrations} Accounts
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Roster directory scale</span>
          </div>
          <div className="p-3 bg-zinc-800 text-zinc-350 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Awaiting Verification</p>
            <h3 className={`text-2xl font-black mt-1 ${pendingRegistrations > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-100'}`}>
              {pendingRegistrations} Guests
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Awaiting member elevation approval</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Members count */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Verified Members</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {approvedMembers} Members
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Active dining partners</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Managers */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Meal Managers</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {managersCount} Managers
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Managing menu planners</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Admin Settings Panel (Rate setup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Global Configuration */}
        <div className="lg:col-span-4 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              Global System Variable
            </h3>
            <p className="text-xs text-zinc-400">Configure global meal rates across all dashboards</p>
          </div>

          <form onSubmit={handleUpdateRate} className="space-y-4">
            {settingsError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}
            {settingsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Meal Unit Rate (৳ / Plate)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Current: {mealRate}৳</span>
              </label>
              <input
                id="admin-meal-rate"
                type="number"
                required
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                placeholder="e.g. 45"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold"
              />
            </div>

            <button
              id="btn-save-meal-rate"
              type="submit"
              disabled={loadingRate}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-550 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              {loadingRate ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update System Variable</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-[11px] text-zinc-450 space-y-1">
            <p className="font-bold text-zinc-350">Developer Note:</p>
            <p>Changing this rate adjusts costs across all ledger sheets retroactively and in real-time, enforcing complete balance transparency.</p>
          </div>
        </div>

        {/* User security RBAC manager list */}
        <div className="lg:col-span-8 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Familia RBAC Security Directory
              </h3>
              <p className="text-xs text-zinc-400">Elevate user roles, authorize access, and manage the roster directory</p>
            </div>
            
            <button
              id="admin-refresh-roster"
              onClick={fetchAdminData}
              disabled={loadingUsers}
              className="p-1.5 border border-zinc-800 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all cursor-pointer animate-none"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">User details</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Security Tier (Role)</th>
                  <th className="pb-3">Roster Status</th>
                  <th className="pb-3 text-right pr-2">Quick Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {allUsers.map((usr) => {
                  const isMe = usr.id === user.id;

                  return (
                    <tr key={usr.id} className="hover:bg-zinc-900/30">
                      
                      {/* Name & ID */}
                      <td className="py-3 pl-2">
                        <p className="font-bold text-zinc-150 flex items-center gap-1.5">
                          {usr.name}
                          {isMe && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-200 font-bold px-1.5 py-0.2 rounded">
                              Me
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">{usr.email}</p>
                      </td>

                      {/* Phone */}
                      <td className="py-3 text-xs text-zinc-400 font-medium font-mono">
                        {usr.phone}
                      </td>

                      {/* Role selection select */}
                      <td className="py-3">
                        <select
                          id={`select-role-${usr.id}`}
                          disabled={isMe}
                          value={usr.role}
                          onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, e.target.value as UserRole, usr.status)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:bg-zinc-950 disabled:text-zinc-600 cursor-pointer"
                        >
                          <option value="user">Guest (User)</option>
                          <option value="member">Member</option>
                          <option value="manager">Meal Manager</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </td>

                      {/* Status select */}
                      <td className="py-3">
                        <select
                          id={`select-status-${usr.id}`}
                          disabled={isMe}
                          value={usr.status}
                          onChange={(e) => handleUpdateUserRoleAndStatus(usr.id, usr.role, e.target.value as any)}
                          className={`px-2.5 py-1 border rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:bg-zinc-950 disabled:text-zinc-650 cursor-pointer ${
                            usr.status === 'approved' 
                              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' 
                              : usr.status === 'rejected' 
                              ? 'bg-red-500/15 border-red-500/25 text-red-400' 
                              : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                          }`}
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Quick Commands */}
                      <td className="py-3 text-right pr-2">
                        {isMe ? (
                          <span className="text-[10px] text-zinc-500 font-bold select-none uppercase">Superuser</span>
                        ) : (
                          <div className="flex justify-end gap-1 text-[11px] font-bold">
                            {usr.role === 'user' && (
                              <button
                                id={`cmd-approve-member-${usr.id}`}
                                onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg cursor-pointer"
                              >
                                Accept Member
                              </button>
                            )}
                            {usr.role === 'member' && (
                              <button
                                id={`cmd-promote-manager-${usr.id}`}
                                onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'manager', 'approved')}
                                className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/25 rounded-lg cursor-pointer"
                              >
                                Promote Manager
                              </button>
                            )}
                            {usr.role === 'manager' && (
                              <button
                                id={`cmd-demote-member-${usr.id}`}
                                onClick={() => handleUpdateUserRoleAndStatus(usr.id, 'member', 'approved')}
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg cursor-pointer"
                              >
                                Demote Member
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
