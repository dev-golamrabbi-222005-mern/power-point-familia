import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Check, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = tab === 'login' 
      ? { email, password } 
      : { email, password, name, phone };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please try again.');
      }

      setSuccessMsg(data.message || 'Success!');
      
      // Delay to let the user see the success state
      setTimeout(() => {
        onSuccess(data.user, data.token);
        onClose();
        // Reset forms
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setError('');
        setSuccessMsg('');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#111111] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-800 animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-[#0f0f0f]">
          <h2 className="font-display font-bold text-xl text-zinc-100">
            {tab === 'login' ? 'Welcome Back' : 'Join Power Point Familia'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-800/60">
          <button
            id="tab-login"
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors cursor-pointer ${
              tab === 'login' 
                ? 'text-emerald-500 border-b-2 border-emerald-500 bg-[#0f0f0f]/30' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/10'
            }`}
          >
            Login
          </button>
          <button
            id="tab-register"
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 text-center font-semibold text-sm transition-colors cursor-pointer ${
              tab === 'register' 
                ? 'text-emerald-500 border-b-2 border-emerald-500 bg-[#0f0f0f]/30' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/10'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +8801712345678"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            id="auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : tab === 'login' ? (
              'Sign In'
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Modal Footer / Quick Credentials Helper */}
        <div className="bg-[#0f0f0f] px-6 py-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            {tab === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              id="auth-toggle-tab"
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-emerald-500 hover:text-emerald-400 font-bold ml-1 hover:underline cursor-pointer bg-transparent border-none"
            >
              {tab === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
