'use client';

import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import CalendarTab from '@/src/components/dashboard/(member)/CalendarTab';

export default function MemberCalendarPage() {
  const { token } = useAuth();
  if (!token) return null;

  return (
    <div>
      <h2 className="section-title mb-6">Bazaar Duty & Monthly Activity Calendar</h2>
      <CalendarTab token={token} />
    </div>
  );
}
