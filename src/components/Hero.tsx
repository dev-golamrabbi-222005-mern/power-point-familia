import React from 'react';
import { Utensils, Shield, CheckCircle2, TrendingUp, Users, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { MealMenu } from '../types';

interface HeroProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onDemoLogin: (email: string) => void;
  menus: MealMenu[];
  mealRate: number;
}

export default function Hero({ onLoginClick, onRegisterClick, onDemoLogin, menus, mealRate }: HeroProps) {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayMenus = menus.filter(m => m.date === todayDate);

  const demoAccounts = [
    { name: 'Admin', email: 'admin@familia.com', desc: 'Manage users, assign roles & set rates' },
    { name: 'Manager', email: 'manager@familia.com', desc: 'Publish daily menus & approve deposits' },
    { name: 'Member', email: 'member@familia.com', desc: 'Book daily meals & request deposits' },
    { name: 'Guest', email: 'guest@familia.com', desc: 'Pending user, update profile setup' }
  ];

  return (
    <div id="home-landing" className="relative overflow-hidden pt-12 pb-24 bg-[#0a0a0a]">
      {/* Decorative background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-full shadow-sm tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cohesive Meal Management Ecosystem</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-100 leading-none">
              Smart dining, <br />
              <span className="italic font-serif text-emerald-500">Perfectly managed</span> <br />
              for your familia.
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              Power Point Familia coordinates meal schedules, daily menus, and financial balances with absolute transparent data isolation. Built for families, shared apartments, and small organizations.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="btn-register-hero"
                onClick={onRegisterClick}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-150 flex items-center gap-2 cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                id="btn-login-hero"
                onClick={onLoginClick}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium border border-zinc-800 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-8 mt-12">
              <div>
                <p className="text-3xl font-light text-zinc-100">{mealRate}৳</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Standard Meal Rate</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-100">4 Tiers</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">RBAC Access Levels</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-100">100%</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Food Waste Free</p>
              </div>
            </div>
          </div>

          {/* Today's Menu Display */}
          <div className="lg:col-span-5 bg-[#111111] border border-zinc-800/80 shadow-2xl rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live System Active</span>
            </div>
            
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-100">Today's Menu</h3>
                <p className="text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {todayMenus.length > 0 ? (
              <div className="space-y-4">
                {todayMenus.map((menu) => (
                  <div key={menu.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/80">
                    <div className="flex justify-between items-center mb-2">
                      <span className="capitalize text-[10px] font-bold text-zinc-400 tracking-wider bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800/80 shadow-xs">
                        {menu.mealType}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/15">
                        Est. Cost: {menu.estimatedCost}৳
                      </span>
                    </div>
                    <ul className="grid grid-cols-2 gap-2 text-zinc-300 text-sm mt-3 font-sans">
                      {menu.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 font-medium">Menu is pending publication.</p>
                <p className="text-xs text-zinc-500 mt-1">Managers publish menus daily!</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Demo Testing Shortcut</h4>
              <p className="text-xs text-zinc-400 mb-3">Instantly simulate any RBAC access level with a pre-seeded account:</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    id={`btn-demo-${acc.name.toLowerCase()}`}
                    onClick={() => onDemoLogin(acc.email)}
                    className="p-2 bg-[#18181b]/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-left transition-all text-xs hover:border-emerald-500/40 shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-200">
                      <span>{acc.name}</span>
                      <span className="text-[10px] text-emerald-500 group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{acc.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-2.5 text-center text-[10px] text-zinc-400 font-medium bg-zinc-950/50 py-1.5 rounded border border-zinc-800/80">
                Default Password: <span className="font-mono bg-zinc-900 text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-800">password123</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight sm:text-4xl">
            Designed for transparent dining management
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Power Point Familia implements explicit data separation and actions for each administrative tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              1
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              Role-Based Isolations
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Strict RBAC enforcement prevents access crossover. Guests, members, managers, and developer admins work in custom dashboards.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              2
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" />
              Flexible Bookings
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Members book exact meal counts for lunch or dinner. Meal schedules can be customized up to several days in advance.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              3
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Rate Engine
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Dynamic financial balances. Every consumed meal is factored into a member's ledger instantly against their approved deposits.
            </p>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-xl flex items-center justify-center font-bold text-lg mb-5">
              4
            </div>
            <h3 className="font-bold text-lg text-zinc-200 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Family Centered
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Designed for transparency. No hidden charges, fully real-time ledgers, and profile editing to keep phone and contact info fresh.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
