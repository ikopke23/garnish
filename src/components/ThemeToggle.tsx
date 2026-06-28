import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('garnish-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('garnish-mode', 'light');
    }
  };

  return (
    <button
      className="nav-icon-btn"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ color: 'var(--text)' }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
