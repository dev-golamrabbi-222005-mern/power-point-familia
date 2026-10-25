'use client';

import React from 'react';
import { DashboardProvider } from '@/src/context/DashboardContext';
import DashboardTopBar from '@/src/components/dashboard/DashboardTopBar';
import DashboardSidebar from '@/src/components/shared/DashboardSidebar';
import MobileDock from '@/src/components/dashboard/MobileDock';
import QuickMealModal from '@/src/components/dashboard/QuickMealModal';
import QuickExpenseModal from '@/src/components/dashboard/QuickExpenseModal';
import QuickApproveModal from '@/src/components/dashboard/QuickApproveModal';
import ProfileSettingsModal from '@/src/components/dashboard/ProfileSettingsModal';
import GlobalLiveBazaarModal from '@/src/components/dashboard/GlobalLiveBazaarModal';

export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Sleek App Shell Top Bar (No public nav) */}
        <DashboardTopBar />

        {/* Dashboard Main Workspace Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Desktop Left Sidebar (hidden on mobile) */}
          <DashboardSidebar />

          {/* Page Content (padded on mobile for bottom floating dock) */}
          <main className="flex-1 max-w-5xl min-w-0 pb-28 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile PWA Floating Bottom Dock */}
        <MobileDock />

        {/* Global Dashboard Modals */}
        <QuickMealModal />
        <QuickExpenseModal />
        <QuickApproveModal />
        <ProfileSettingsModal />
        <GlobalLiveBazaarModal />
      </div>
    </DashboardProvider>
  );
}
