'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import MealTab from '@/src/components/dashboard/(member)/MealTab';

export default function MemberMealsPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Meal Bookings & Daily Menu</h2>
      <MealTab token={token} />
    </div>
  );
}
