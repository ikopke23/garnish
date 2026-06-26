import { useState, useEffect } from 'react';

export function useRecipeMultiplier(rid: string): [number, (v: number) => void] {
  const key = `recipeMultiplier-${rid}`;

  const [multiplier, setMultiplier] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const n = parseFloat(raw);
        if (isFinite(n) && n > 0) return n;
      }
    } catch {
      // private browsing — ignore
    }
    return 1;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, String(multiplier));
    } catch {
      // private browsing — ignore
    }
  }, [multiplier, key]);

  return [multiplier, setMultiplier];
}
