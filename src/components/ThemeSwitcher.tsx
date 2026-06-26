import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type ThemeKey } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

const THEMES: { key: ThemeKey; label: string; tagline: string; dots: [string, string, string] }[] = [
  { key: 'rose',  label: 'Rose & Honey', tagline: 'Raspberry & honey',  dots: ['#D6336C', '#EBA13C', '#B5174E'] },
  { key: 'ember', label: 'Fire & Ember', tagline: 'Warm autumn tones',  dots: ['#FF8200', '#FFC100', '#FF0000'] },
  { key: 'sage',  label: 'Sage & Olive', tagline: 'Cool garden greens', dots: ['#5F7A3F', '#B89D3C', '#A64B2A'] },
  { key: 'plum',  label: 'Plum & Bone',  tagline: 'Rich jewel tones',   dots: ['#6B2E4E', '#C08A5C', '#A43F3F'] },
];

function ThemeDots({ dots }: { dots: [string, string, string] }) {
  return (
    <span className="flex gap-0.5">
      {dots.map((color, i) => (
        <span
          key={i}
          style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}
        />
      ))}
    </span>
  );
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();
  const current = THEMES.find(t => t.key === theme) ?? THEMES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="nav-icon-btn"
          style={{ width: 'auto', borderRadius: 20, padding: '0 10px', gap: 6 }}
          aria-label="Switch theme"
        >
          <ThemeDots dots={current.dots} />
          <span className="hidden md:inline" style={{ fontSize: 12, fontFamily: '"Cinzel", Georgia, serif', letterSpacing: '0.04em' }}>
            {current.label}
          </span>
          <ChevronDown size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ width: 240 }}>
        {THEMES.map(t => (
          <DropdownMenuItem
            key={t.key}
            onSelect={() => setTheme(t.key)}
            style={
              t.key === theme
                ? { borderLeft: '3px solid var(--primary-hex)', background: 'color-mix(in srgb, var(--primary-hex) 10%, transparent)', cursor: 'default' }
                : { borderLeft: '3px solid transparent' }
            }
          >
            <span className="flex items-center gap-2">
              <ThemeDots dots={t.dots} />
              <span>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{t.tagline}</div>
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <span style={{ fontSize: 12, fontFamily: '"Cinzel", Georgia, serif', letterSpacing: '0.05em', color: 'var(--muted-hex)' }}>Mode</span>
          <ThemeToggle />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
