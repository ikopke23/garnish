import { useState } from 'react';

export type ThemeKey = 'ember' | 'sage' | 'plum';

export function useTheme(): [ThemeKey, (theme: ThemeKey) => void] {
  const [theme, setThemeState] = useState<ThemeKey>(
    () => (localStorage.getItem('garnish-theme') as ThemeKey) ?? 'ember'
  );

  const setTheme = (next: ThemeKey) => {
    localStorage.setItem('garnish-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    setThemeState(next);
  };

  return [theme, setTheme];
}
