import React, { useState, useEffect } from 'react';
import { User, MealMenu, DashboardStats } from './types';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/DashboardLayout';
import GuestDashboard from './components/GuestDashboard';
import MemberDashboard from './components/MemberDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Utensils, Shield, KeyRound, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // App-wide data state
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [mealRate, setMealRate] = useState<number>(45);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Modal triggers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Load user session from local storage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('familia_token');
    const storedUser = localStorage.getItem('familia_user');

    const verifySession = async () => {
      if (storedToken && storedUser) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem('familia_token');
            localStorage.removeItem('familia_user');
          }
        } catch (err) {
          console.error('Session validation error', err);
        }
      }
      setAppLoading(false);
    };

    verifySession();
  }, []);

  // Fetch collective global menus and settings
  const fetchGlobalData = async (activeToken?: string | null) => {
    const bearerToken = activeToken || token;
    if (!bearerToken) return;

    try {
      // 1. Menus
      const menusRes = await fetch('/api/menu', {
        headers: { 'Authorization': `Bearer ${bearerToken}` }
      });
      if (menusRes.ok) {
        const menusData = await menusRes.json();
        setMenus(menusData);
      }

      // 2. Meal settings rate
      const settingsRes = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${bearerToken}` }
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setMealRate(settingsData.mealRate || 45);
      }

      // 3. User & System aggregates
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${bearerToken}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Global data fetch error', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGlobalData();
    }
  }, [token]);

  const handleAuthSuccess = (loggedUser: User, loggedToken: string) => {
    setUser(loggedUser);
    setToken(loggedToken);
    localStorage.setItem('familia_token', loggedToken);
    localStorage.setItem('familia_user', JSON.stringify(loggedUser));
    fetchGlobalData(loggedToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setStats(null);
    localStorage.removeItem('familia_token');
    localStorage.removeItem('familia_user');
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('familia_user', JSON.stringify(updatedUser));
  };

  const handleDemoLogin = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await response.json();
      if (response.ok) {
        handleAuthSuccess(data.user, data.token);
      } else {
        alert(data.message || 'Demo credentials invalid.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render proper dashboard according to role
  const renderDashboardByRole = () => {
    if (!user || !token) return null;

    switch (user.role) {
      case 'admin':
        return (
          <AdminDashboard
            user={user}
            token={token}
            mealRate={mealRate}
            onRefreshSettings={() => fetchGlobalData()}
          />
        );
      case 'manager':
        return (
          <ManagerDashboard
            user={user}
            token={token}
            menus={menus}
            mealRate={mealRate}
            onRefreshMenus={() => fetchGlobalData()}
          />
        );
      case 'member':
        return (
          <MemberDashboard
            user={user}
            token={token}
            menus={menus}
            mealRate={mealRate}
            onRefreshStats={() => fetchGlobalData()}
          />
        );
      case 'user':
      default:
        return (
          <GuestDashboard
            user={user}
            stats={stats}
            onDemoSwitch={handleDemoLogin}
          />
        );
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-display font-bold text-zinc-100">Booting Power Point Familia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Brand Header for Landing page */}
      {!user && (
        <nav className="bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 py-4 shadow-xl shadow-black/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">
                P
              </div>
              <div>
                <span className="font-display font-extrabold text-sm tracking-tight text-zinc-100 block leading-tight">
                  Power Point Familia
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block">
                  MEAL SYSTEMS CO.
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                id="header-login"
                onClick={() => { setAuthTab('login'); setIsAuthOpen(true); }}
                className="px-4 py-2 hover:bg-zinc-850 text-zinc-200 text-xs font-bold rounded-xl transition-all border border-zinc-800 shadow-3xs cursor-pointer"
              >
                Sign In
              </button>
              <button
                id="header-register"
                onClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main viewport */}
      <div className="flex-1">
        {user && token ? (
          <DashboardLayout
            user={user}
            token={token}
            stats={stats}
            onLogout={handleLogout}
            onProfileUpdated={handleProfileUpdated}
          >
            {renderDashboardByRole()}
          </DashboardLayout>
        ) : (
          <Hero
            onLoginClick={() => { setAuthTab('login'); setIsAuthOpen(true); }}
            onRegisterClick={() => { setAuthTab('register'); setIsAuthOpen(true); }}
            onDemoLogin={handleDemoLogin}
            menus={menus}
            mealRate={mealRate}
          />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Global Landing Footer */}
      {!user && (
        <footer className="bg-[#09090b] border-t border-zinc-800/85 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-black text-xs">
                P
              </div>
              <span className="font-display font-bold text-zinc-100 text-xs">Power Point Familia</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-mono text-center md:text-right">
              Secured with JWT (JSON Web Tokens) & PBKDF2 Password Hashing. Powered by React, Vite, and Express.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
