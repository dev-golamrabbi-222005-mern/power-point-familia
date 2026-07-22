'use client';

import Link from 'next/link';
import { ArrowLeft, Utensils, Users, Shield, TrendingUp, Github, Heart, Coffee } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-full mb-4">
            <Heart className="w-3.5 h-3.5" />
            <span>About Our Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-zinc-100 mb-4">
            Power Point <span className="text-emerald-500">Familia</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A comprehensive meal management system designed to bring transparency, efficiency, and harmony 
            to shared dining experiences in families, hostels, and small organizations.
          </p>
        </div>

        {/* Purpose Section */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-zinc-100 mb-4">Our Purpose</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Power Point Familia was born from a simple yet persistent problem: managing shared meal expenses 
            is tedious, error-prone, and often leads to misunderstandings. We set out to build a tool that 
            automates meal tracking, financial calculations, and role-based access so everyone can focus on 
            enjoying their meals rather than arguing over bills.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Whether you're managing a family kitchen, a student hostel mess, or a small office cafeteria, 
            our platform provides real-time insights into meal consumption, deposits, and balances — all 
            wrapped in a secure, role-based interface.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-zinc-100 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100 mb-2">Register & Get Approved</h3>
              <p className="text-sm text-zinc-400">Sign up as a member. An admin approves your account and assigns your role. You're now part of the Familia!</p>
            </div>
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100 mb-2">Book Your Meals</h3>
              <p className="text-sm text-zinc-400">View published menus and book lunch/dinner daily. The system tracks your meal count in real-time.</p>
            </div>
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100 mb-2">Live Rate Calculation</h3>
              <p className="text-sm text-zinc-400">Meal costs are calculated dynamically: total expenses ÷ total meals. No fixed rates, complete transparency.</p>
            </div>
            <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-100 mb-2">Role-Based Access</h3>
              <p className="text-sm text-zinc-400">Members track meals, managers publish menus and verify payments, admins configure the system — all in isolated dashboards.</p>
            </div>
          </div>
        </div>

        {/* Financial Model */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-zinc-100 mb-4">Financial Model</h2>
          <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
            <p>Our system operates on a transparent weekly payment model:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li><span className="text-zinc-200 font-semibold">Weekly Contribution:</span> 500 BDT per member per week</li>
              <li><span className="text-zinc-200 font-semibold">Starting Week:</span> 1000 BDT (first week deposit)</li>
              <li><span className="text-zinc-200 font-semibold">Monthly Flat Rate:</span> 2500 BDT per member (if eating daily)</li>
              <li><span className="text-zinc-200 font-semibold">Live Meal Rate:</span> Total weekly cost ÷ Total meals consumed = cost per meal</li>
              <li><span className="text-zinc-200 font-semibold">Settlement:</span> At month end, members receive refunds or pay for excess meals based on actual consumption</li>
            </ul>
          </div>
        </div>

        {/* Creators Section */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-zinc-100 mb-6 text-center">Meet The Developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800/80">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-black text-emerald-400">A</span>
              </div>
              <h3 className="font-bold text-zinc-100">Adeeb</h3>
              <p className="text-xs text-zinc-500 mt-1">Full-Stack Developer</p>
              <p className="text-xs text-zinc-500 mt-2">Building robust systems with Next.js, TypeScript, and MongoDB.</p>
            </div>
            <div className="text-center p-6 bg-zinc-900/30 rounded-xl border border-zinc-800/80">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-black text-emerald-400">A</span>
              </div>
              <h3 className="font-bold text-zinc-100">Abdullah</h3>
              <p className="text-xs text-zinc-500 mt-1">Full-Stack Developer</p>
              <p className="text-xs text-zinc-500 mt-2">Crafting intuitive UIs and seamless user experiences.</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
              Built with <Coffee className="w-4 h-4 text-amber-500" /> and 
              <Heart className="w-4 h-4 text-red-500" /> using Next.js, TypeScript, Tailwind CSS & MongoDB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
