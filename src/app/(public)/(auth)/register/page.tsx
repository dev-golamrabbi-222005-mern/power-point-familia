'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { PPFLogo } from '@/src/components/shared/PPFLogo';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-[#111111] border border-zinc-800 rounded-3xl shadow-2xl space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <PPFLogo size="lg" />
        <div>
          <h1 className="text-xl font-display font-black text-white mt-2">Join Familia</h1>
          <p className="text-xs text-zinc-400">Instant registration with your verified Google Account</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign-Up Button */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 text-white font-bold text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="group-hover:text-emerald-400 transition-colors">
            {loading ? 'Connecting...' : 'Sign up with Google'}
          </span>
        </button>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-300">
            No password required. Your Google profile is securely verified, and new registrations are assigned to the mess member waitlist or administrator approval.
          </p>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
