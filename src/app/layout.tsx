import '@/src/index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Power Point Familia - Meal Management System',
  description: 'Full-stack Meal Management System with robust role-based access control (RBAC), menu planning, deposit tracking, and cost calculation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
