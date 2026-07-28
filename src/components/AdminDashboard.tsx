import React, { useState, useEffect } from 'react';
import { User, UserRole, MealMenu } from '../types';
import { ShieldAlert, Users, ShieldCheck, TrendingUp, UserCheck, ChefHat, SlidersHorizontal } from 'lucide-react';

import AdminOverviewTab from './dashboard/AdminOverviewTab';
import AdminMemberViewTab from './dashboard/AdminMemberViewTab';
import AdminManagerViewTab from './dashboard/AdminManagerViewTab';
import AdminUserDirectoryTab from './dashboard/AdminUserDirectoryTab';
import AdminPermissionsTab from './dashboard/AdminPermissionsTab';

interface AdminDashboardProps {
  user: User;
  token: string;
  mealRate: number;
  onRefreshSettings: () => void;
}

export type AdminTabType = 'overview' | 'member-view' | 'manager-view' | 'users' | 'permissions';

export default function AdminDashboard({ user, token, mealRate, onRefreshSettings }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchAdminData = async () => {
    setLoadingUsers(true);
    try {
      const usersRes = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) setAllUsers(usersData);

      const menusRes = await fetch('/api/menu', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (menusRes.ok) setMenus(await menusRes.json());
    } catch (error) {
      console.error('Error in admin fetch', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const tabs: { id: AdminTabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'member-view', label: 'Member View', icon: UserCheck },
    { id: 'manager-view', label: 'Manager View', icon: ChefHat },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Executive Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-600/20 via-indigo-600/15 to-emerald-600/20 border border-purple-500/25 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Superuser Console
              </span>
              <span className="text-xs text-zinc-400 font-bold">• System Administrator</span>
            </div>
            <h2 className="text-xl font-black text-zinc-100 mt-0.5">
              Power Point Familia Super Admin Panel
            </h2>
          </div>
        </div>
      </div>

      {/* Main 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md font-black border-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab View Rendering */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            token={token}
            allUsers={allUsers}
            menus={menus}
            mealRate={mealRate}
          />
        )}

        {activeTab === 'member-view' && (
          <AdminMemberViewTab
            token={token}
            allUsers={allUsers}
            menus={menus}
            mealRate={mealRate}
            onRefreshStats={fetchAdminData}
          />
        )}

        {activeTab === 'manager-view' && (
          <AdminManagerViewTab
            token={token}
            allUsers={allUsers}
            menus={menus}
            mealRate={mealRate}
            onRefreshMenus={fetchAdminData}
          />
        )}

        {activeTab === 'users' && (
          <AdminUserDirectoryTab
            currentUser={user}
            token={token}
            allUsers={allUsers}
            loadingUsers={loadingUsers}
            onRefreshData={fetchAdminData}
          />
        )}

        {activeTab === 'permissions' && (
          <AdminPermissionsTab
            token={token}
            mealRate={mealRate}
            onRefreshSettings={onRefreshSettings}
          />
        )}
      </div>
    </div>
  );
}
