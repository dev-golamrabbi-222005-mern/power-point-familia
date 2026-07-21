'use client';

import dynamic from 'next/dynamic';

// Disable SSR to prevent any hydration mismatch with localStorage or browser APIs
const App = dynamic(() => import('@/src/App'), { ssr: false });

export default function Home() {
  return <App />;
}
