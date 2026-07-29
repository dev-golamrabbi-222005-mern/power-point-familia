import React from 'react';
import { Shield, Utensils, TrendingUp, Users } from 'lucide-react';

export const HeroFeaturesGrid: React.FC = () => {
  return (
    <div className="container-custom section-gap">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="section-title">
          Designed for transparent dining management
        </h2>
        <p className="mt-4 text-lg text-zinc-400">
          Power Point Familia implements explicit data separation and actions
          for each administrative tier.
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
            Strict RBAC enforcement prevents access crossover. Guests,
            members, managers, and developer admins work in custom dashboards.
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
            Members book exact meal counts for lunch or dinner. Meal schedules
            can be customized up to several days in advance.
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
            Dynamic financial balances. Every consumed meal is factored into a
            member's ledger instantly against their approved deposits.
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
            Designed for transparency. No hidden charges, fully real-time
            ledgers, and profile editing to keep phone and contact info fresh.
          </p>
        </div>
      </div>
    </div>
  );
};
