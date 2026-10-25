'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import Hero from '@/src/components/Hero';
import { MealMenu } from '@/src/types';

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [mealRate, setMealRate] = useState<number>(45);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMenu = await fetch('/api/menu');
        if (resMenu.ok) setMenus(await resMenu.json());

        const resSet = await fetch('/api/settings');
        if (resSet.ok) {
          const s = await resSet.json();
          setMealRate(s.mealRate || 45);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleDemoLogin = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        router.push('/dashboard');
      } else {
        alert(data.message || 'Demo login failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Hero
      onLoginClick={() => router.push('/login')}
      onRegisterClick={() => router.push('/register')}
      onDemoLogin={handleDemoLogin}
      menus={menus}
      mealRate={mealRate}
    />
  );
}
