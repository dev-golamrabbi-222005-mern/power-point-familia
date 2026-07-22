import React, { useState } from 'react';
import { LogOut, User as UserIcon, Phone, Mail, Settings, Check, AlertCircle, Save, Menu, X, Coins, ShieldCheck, UserCheck, Shield } from 'lucide-react';
import { User, DashboardStats } from '../types';

interface DashboardLayoutProps {
  user: User;
  token: string;
  stats: DashboardStats | null;
  onLogout: () => void;
  onProfileUpdated: (updatedUser: User) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, token, stats, onLogout, onProfileUpdated, children }: DashboardLayoutProps) {
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profilePassword, setProfilePassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine user role accent colors
  const roleColors: Record<User['role'], { bg: string; text: string; label: string; icon: any }> = {
    user: { bg: 'bg-zinc-800 border border-zinc-700', text: 'text-zinc-300', label: 'Guest User', icon: AlertCircle },
    member: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Familia Member', icon: UserCheck },
    manager: { bg: 'bg-teal-500/10 border border-teal-500/20', text: 'text-teal-400', label: 'Meal Manager', icon: Coins },
    admin: { bg: 'bg-purple-500/10 border border-purple-500/20', text: 'text-purple-400', label: 'System Admin', icon: ShieldCheck },
  };

  const currentRoleColor = roleColors[user.role] || roleColors.user;
  const RoleIcon = currentRoleColor.icon;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setUpdating(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          ...(profilePassword ? { password: profilePassword } : {})
        })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      setProfileMsg('Profile updated successfully!');
      onProfileUpdated(data.user);
      setProfilePassword('');
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div id="dashboard-wrapper" className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-[#0f0f0f]/95 border-b border-zinc-800 sticky top-0 z-30 shadow-lg shadow-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                P
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight text-zinc-100 block leading-tight">
                  Power Point Familia
                </span>
                <span className="text-[10px] text-zinc-500 font-mono font-medium block">
                  MEAL SYSTEM
                </span>
              </div>
            </div>

            {/* Desktop Navigation Controls */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Role badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentRoleColor.bg} ${currentRoleColor.text}`}>
                <RoleIcon className="w-4 h-4 shrink-0" />
                <span>{currentRoleColor.label}</span>
              </div>

              {/* Profile setup toggler */}
              <button
                id="btn-toggle-profile"
                onClick={() => setShowProfileSettings(!showProfileSettings)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                  showProfileSettings 
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700' 
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>

              {/* Logout button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-semibold rounded-lg border border-rose-500/25 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111111] border-b border-zinc-800 p-4 space-y-3 shadow-md animate-in slide-in-from-top-4 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/85 pb-3 mb-2">
            <div>
              <p className="font-bold text-zinc-100 text-sm">{user.name}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentRoleColor.bg} ${currentRoleColor.text}`}>
              {currentRoleColor.label}
            </div>
          </div>
          
          <button
            id="mobile-btn-profile"
            onClick={() => {
              setShowProfileSettings(!showProfileSettings);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg text-sm font-medium cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5 text-zinc-500" />
            Profile Settings
          </button>

          <button
            id="mobile-btn-logout"
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-500/80" />
            Logout
          </button>
        </div>
      )}

      {/* Main Container Area with Profile panel slide */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Settings Panel */}
        {showProfileSettings && (
          <div className="mb-8 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-2xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-500" />
                  Account Profile Information
                </h3>
                <p className="text-xs text-zinc-400">Update your basic name, phone or credential details</p>
              </div>
              <button 
                onClick={() => setShowProfileSettings(false)}
                className="text-zinc-400 hover:text-zinc-250 p-1 bg-zinc-900 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{profileMsg}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Email (Cannot Change)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 text-zinc-500 rounded-xl text-sm cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-500">Locked</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    New Password (Leave blank to keep current)
                  </label>
                  <input
                    id="profile-password"
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    placeholder="Enter new secure password"
                    minLength={6}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-save-profile"
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {updating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dashboard Panels Body */}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#09090b] border-t border-zinc-800/85 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 font-mono">
          <p>© 2026 Power Point Familia Meal System. All rights reserved.</p>
          <p className="mt-1 text-[10px] text-zinc-600">Strictly Isolated RBAC Enterprise Workspace (PORT: 3000)</p>
        </div>
      </footer>

    </div>
  );
}
