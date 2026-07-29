import React from 'react';
import Link from 'next/link';
import { PPFLogo } from './PPFLogo';
import { User } from '../../types';

interface NavbarProps {
  user?: User | null;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onRegisterClick, onLogout }) => {
  return (
    <nav className="bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40 py-4 shadow-xl shadow-black/15">
      <div className="container-custom flex justify-between items-center">
        <Link href="/">
          <PPFLogo size="md" />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/about" className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors">
            Contact
          </Link>

          {!user ? (
            <div className="flex gap-2 ml-2">
              <button
                onClick={onLoginClick}
                className="px-4 py-2 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl transition-all border border-zinc-800 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Register
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
