'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { User, Mail, Lock, Phone, UserPlus, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccess('Account created successfully! Auto-signing in...');
      setTimeout(() => {
        login(data.token, data.user);
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-[#111111] border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-2">
          <UserPlus className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-black text-white">Join Power Point Familia</h1>
        <p className="text-xs text-zinc-400">Register your member profile to start managing meals</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Golam Rabbi"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@powerpoint.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Mobile Phone</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801700000000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black text-sm rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
