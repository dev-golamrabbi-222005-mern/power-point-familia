import React from 'react';
import { User, DashboardStats } from '../types';
import { Clock, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface GuestDashboardProps {
  user: User;
  stats: DashboardStats | null;
  onDemoSwitch: (email: string) => void;
}

export default function GuestDashboard({ user, stats, onDemoSwitch }: GuestDashboardProps) {
  const currentStatus = user.status;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner Greeting */}
      <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/6 opacity-10">
          <Clock className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-700 text-white font-bold text-xs rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Approval</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold">
            Hello, {user.name}!
          </h2>
          <p className="text-emerald-50 text-sm">
            Welcome to Power Point Familia. Your account is successfully registered in the system! You are currently classified under the guest tier.
          </p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Registration Status & Workspace Info
            </h3>
            
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/80 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Pending Member Elevation</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Only recognized Familia Members can book meals and deposit funds. Once the system Admin verifies your credentials, they will elevate your role to <strong>Member</strong>, granting full ledger access.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Account Credentials:</p>
              <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-950/50 p-3 rounded-lg border border-zinc-850/80 font-mono">
                <div>
                  <span className="text-zinc-500">Email:</span> <span className="text-zinc-350 font-semibold">{user.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Phone:</span> <span className="text-zinc-350 font-semibold">{user.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Tier:</span> <span className="text-emerald-400 font-bold capitalize">{user.role}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Status:</span> <span className="text-emerald-400 font-bold capitalize">{user.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/85 pt-5 mt-6 flex items-center justify-between text-xs text-zinc-500">
            <span>You can update your personal Name and Phone in the Profile Settings anytime.</span>
          </div>
        </div>

        {/* Demo Fast Sandbox Switcher */}
        <div className="bg-[#111111] border border-zinc-800 text-zinc-100 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 text-emerald-400 text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Developer Sandbox</span>
            </div>
            
            <h3 className="font-display font-bold text-lg text-white">
              Explore Active Dashboards
            </h3>
            
            <p className="text-zinc-400 text-xs leading-relaxed">
              Skip the wait! Click below to instantly log out and swap roles to view the full spectrum of our Role-Based Access Control system:
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                id="guest-demo-admin"
                onClick={() => onDemoSwitch('admin@familia.com')}
                className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/30 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400">System Admin</p>
                  <p className="text-[10px] text-zinc-500">Configure roles & database keys</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                id="guest-demo-manager"
                onClick={() => onDemoSwitch('manager@familia.com')}
                className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/30 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400">Meal Manager</p>
                  <p className="text-[10px] text-zinc-500">Post daily menus & approve deposits</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                id="guest-demo-member"
                onClick={() => onDemoSwitch('member@familia.com')}
                className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/30 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400">Familia Member</p>
                  <p className="text-[10px] text-zinc-500">Book daily meals & track ledger balances</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center gap-1.5 font-mono mt-4">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Password for all: password123</span>
          </div>
        </div>

      </div>

    </div>
  );
}
