'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      login(data.token, data.user);
      router.push('/dashboard');
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
          <LogIn className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-black text-white">Welcome Back</h1>
        <p className="text-xs text-zinc-400">Sign in to your Power Point Familia account</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-4 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
