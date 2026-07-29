import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">{children}</div>;
}
