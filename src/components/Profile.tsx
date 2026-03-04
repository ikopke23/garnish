import { useAuth } from '../context/useAuth';
import { NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';

export default function Profile() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return null;
  return (
    <NavItem>
      <NavLink to="/profile" className="nav-link">{user.username}</NavLink>
    </NavItem>
  );
}
