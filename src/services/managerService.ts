export async function assignBazaarDuty(token: string, payload: { userId: string; member2Id?: string; date: string; shoppingList?: string[]; budget?: number }) {
  const res = await fetch('/api/bazaar/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to assign bazaar duty.');
  return await res.json();
}

export async function assignFixedCostsAndDue(token: string, payload: { targetUserId: string; fixedCosts?: any; pastMonthDue?: number }) {
  const res = await fetch('/api/finance/assign-costs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to assign fixed costs and due.');
  return await res.json();
}
