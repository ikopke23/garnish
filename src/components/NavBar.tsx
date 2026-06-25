import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../context/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: 'var(--nav-fg)',
  textDecoration: 'none',
  fontSize: 14,
  opacity: isActive ? 1 : 0.8,
  fontFamily: '"Lora", Georgia, serif',
  fontWeight: isActive ? 600 : 400,
});

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        background: 'var(--nav-bg)',
        color: 'var(--nav-fg)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
      }}
    >
      {/* Primary row */}
      <div
        style={{
          height: 58,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          gap: 24,
        }}
        className="md:px-8 px-4"
      >
        {/* Wordmark */}
        <NavLink
          to="/"
          style={{
            fontFamily: '"Cinzel", Georgia, serif',
            fontWeight: 700,
            letterSpacing: '0.08em',
            fontSize: 20,
            color: 'var(--nav-fg)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          garnish
        </NavLink>

        {/* Desktop nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <NavLink to="/" style={navLinkStyle}>Feed</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/recipes/create" style={navLinkStyle}>Create</NavLink>
              <NavLink to="/recipes/import" style={navLinkStyle}>Import</NavLink>
              <NavLink to="/stories/new" style={navLinkStyle}>Story</NavLink>
              <NavLink to="/family" style={navLinkStyle}>Family</NavLink>
            </>
          )}
        </nav>

        {/* Right trio */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-icon-btn" aria-label="Account menu">
                  <ChefHat size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ minWidth: 160 }}>
                <DropdownMenuItem asChild>
                  <NavLink to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {user?.username}
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/login" style={navLinkStyle}>Login</NavLink>
              <NavLink to="/register" style={navLinkStyle}>Register</NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Mobile second row — nav links */}
      <div
        className="md:hidden flex items-center gap-5 px-4 pb-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
      >
        <NavLink to="/" style={navLinkStyle}>Feed</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/recipes/create" style={navLinkStyle}>Create</NavLink>
            <NavLink to="/stories/new" style={navLinkStyle}>Story</NavLink>
            <NavLink to="/family" style={navLinkStyle}>Family</NavLink>
          </>
        )}
        {!isAuthenticated && (
          <>
            <NavLink to="/login" style={navLinkStyle}>Login</NavLink>
            <NavLink to="/register" style={navLinkStyle}>Register</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
