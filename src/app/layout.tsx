import '@/src/global.css';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/src/context/AuthContext';

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: 'Power Point Familia - Meal Management System',
  description: 'Full-stack Meal Management System with robust role-based access control (RBAC), menu planning, deposit tracking, and cost calculation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Familia Meals',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
