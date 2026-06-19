import { useState, useEffect } from 'react';

interface ProgressState {
  ingredients: string[];
  steps: string[];
}

export function useRecipeProgress(rid: string): [ProgressState, (patch: Partial<ProgressState>) => void] {
  const key = `garnish-progress-${rid}`;

  const [state, setState] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as ProgressState) : { ingredients: [], steps: [] };
    } catch {
      return { ingredients: [], steps: [] };
    }
  });

  // Debounced write — avoids thrashing localStorage on every toggle
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, 200);
    return () => clearTimeout(id);
  }, [state, key]);

  const patch = (update: Partial<ProgressState>) =>
    setState(prev => ({ ...prev, ...update }));

  return [state, patch];
}
