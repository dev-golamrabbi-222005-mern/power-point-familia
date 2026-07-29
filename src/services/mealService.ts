export async function fetchMealOverview(token: string) {
  const res = await fetch('/api/dashboard/member-overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch meal overview.');
  return await res.json();
}

export async function toggleMealBooking(token: string, payload: { date: string; mealType: 'lunch' | 'dinner'; count: number }) {
  const res = await fetch('/api/dashboard/meal-toggle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update meal booking.');
  return await res.json();
}
