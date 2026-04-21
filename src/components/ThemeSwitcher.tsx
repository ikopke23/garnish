import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DOTS: [string, string][] = [
  ['#FF8200', 'primary'],
  ['#FFC100', 'secondary'],
  ['#FF0000', 'accent'],
];

function ThemeDots() {
  return (
    <span className="flex gap-0.5">
      {DOTS.map(([color, key]) => (
        <span
          key={key}
          style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}
        />
      ))}
    </span>
  );
}

export default function ThemeSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="nav-icon-btn"
          style={{ width: 'auto', borderRadius: 20, padding: '0 10px', gap: 6 }}
          aria-label="Switch theme"
        >
          <ThemeDots />
          <span className="hidden md:inline" style={{ fontSize: 12, fontFamily: '"Cinzel", Georgia, serif', letterSpacing: '0.04em' }}>
            Fire &amp; Ember
          </span>
          <ChevronDown size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ width: 220 }}>
        <DropdownMenuItem
          style={{
            borderLeft: '3px solid var(--primary-hex)',
            background: 'color-mix(in srgb, var(--primary-hex) 10%, transparent)',
            cursor: 'default',
          }}
        >
          <span className="flex items-center gap-2">
            <ThemeDots />
            <span>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Fire &amp; Ember</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Warm autumn tones</div>
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
