'use client';

import React from 'react';
import DashboardSidebar from '@/src/components/shared/DashboardSidebar';

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-6 md:gap-8">
        <DashboardSidebar />
        <main className="flex-1 max-w-5xl min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
