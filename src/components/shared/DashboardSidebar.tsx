'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import {
  TrendingUp,
  Calendar,
  Utensils,
  Wallet,
  History,
  ClipboardList,
  ChefHat,
  DollarSign,
  Users,
  SlidersHorizontal,
  UserCheck,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [managerMode, setManagerMode] = useState<'manager' | 'member'>('manager');

  if (!user) return null;

  // 1. MEMBER LINKS
  const memberLinks = [
    { href: '/dashboard', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    { href: '/dashboard/meals', label: 'Meals', icon: Utensils },
    { href: '/dashboard/finance', label: 'Finance', icon: Wallet },
    { href: '/dashboard/history', label: 'History', icon: History },
  ];

  // 2. MANAGER LINKS
  const managerLinks = [
    { href: '/dashboard', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/tickets', label: 'Tickets', icon: ClipboardList },
    { href: '/dashboard/meals-bazaar', label: 'Meals & Bazaar', icon: ChefHat },
    { href: '/dashboard/finances', label: 'Finances', icon: DollarSign },
    { href: '/dashboard/manager-history', label: 'History', icon: History },
  ];

  // 3. ADMIN LINKS
  const adminLinks = [
    { href: '/dashboard', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/memberView', label: 'Member View', icon: UserCheck },
    { href: '/dashboard/managerView', label: 'Manager View', icon: ChefHat },
    { href: '/dashboard/users', label: 'Users', icon: Users },
    { href: '/dashboard/permission', label: 'Permissions', icon: SlidersHorizontal },
  ];

  const currentLinks =
    user.role === 'admin'
      ? adminLinks
      : user.role === 'manager'
      ? managerMode === 'manager'
        ? managerLinks
        : memberLinks
      : memberLinks;

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6">
      {/* User Profile Summary Badge */}
      <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-zinc-100 truncate">{user.name}</p>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            {user.role} workspace
          </p>
        </div>
      </div>

      {/* Manager Workspace Mode Switcher */}
      {user.role === 'manager' && (
        <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center">
          <button
            onClick={() => setManagerMode('manager')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              managerMode === 'manager'
                ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            Manager Mode
          </button>
          <button
            onClick={() => setManagerMode('member')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              managerMode === 'member'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Member Mode
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="space-y-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
          Navigation Menu
        </p>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm font-black'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{link.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-emerald-400 translate-x-0.5' : 'text-zinc-600'}`} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
