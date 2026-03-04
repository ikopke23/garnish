import React from 'react';
import {
  Collapse,
  Container,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  Button,
} from 'reactstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/useAuth';

const NavBar: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar color="primary" dark expand="lg">
        <Container>
          <NavItem href="/">
            <img src="/icons8-garnish-lineal-32.png" alt="Garnish" height="32" />
          </NavItem>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink to="/" className="nav-link">Feed</NavLink>
              </NavItem>
              {isAuthenticated && (
                <>
                  <NavItem>
                    <NavLink to="/recipes/create" className="nav-link">Create</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink to="/family" className="nav-link">Family</NavLink>
                  </NavItem>
                </>
              )}
            </Nav>
            <Nav navbar className="ms-auto">
              {isAuthenticated ? (
                <>
                  <NavItem>
                    <NavLink to="/profile" className="nav-link">
                      {user?.username}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <Button color="link" className="nav-link text-white" onClick={handleLogout}>
                      Logout
                    </Button>
                  </NavItem>
                </>
              ) : (
                <>
                  <NavItem>
                    <NavLink to="/login" className="nav-link">Login</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink to="/register" className="nav-link">Register</NavLink>
                  </NavItem>
                </>
              )}
              <NavItem className="nav-link">
                <ThemeToggle />
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
