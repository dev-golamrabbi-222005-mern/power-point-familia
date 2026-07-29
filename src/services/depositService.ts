export async function submitDepositRequest(token: string, payload: { amount: number; paymentMethod: string; transactionId: string; type?: string; remarks?: string }) {
  const res = await fetch('/api/deposits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit deposit request.');
  return await res.json();
}
