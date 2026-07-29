import React from 'react';
import Link from 'next/link';
import { UserRole } from '../../types';
import { LayoutDashboard, History, FileText, Users, DollarSign, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, currentTab, onTabChange }) => {
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'permissions', label: 'Permissions', icon: SlidersHorizontal },
          { id: 'history', label: 'Archives', icon: History },
        ];
      case 'manager':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'meals', label: 'Meals & Bazaar', icon: RefreshCw },
          { id: 'finance', label: 'Finance & Costs', icon: DollarSign },
          { id: 'tickets', label: 'Requests', icon: FileText },
        ];
      case 'member':
      default:
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'meals', label: 'Meal Booking', icon: RefreshCw },
          { id: 'finance', label: 'My Finance', icon: DollarSign },
          { id: 'history', label: 'History', icon: History },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#111111] border-r border-zinc-800 p-4 min-h-screen hidden md:block">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange && onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
