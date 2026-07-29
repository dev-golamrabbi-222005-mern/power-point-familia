import { useState, useEffect } from 'react';

export function useMealRate(token?: string | null) {
  const [mealRate, setMealRate] = useState<number>(45);

  useEffect(() => {
    if (!token) return;
    fetch('/api/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mealRate) setMealRate(data.mealRate);
      })
      .catch((err) => console.error(err));
  }, [token]);

  return mealRate;
}
