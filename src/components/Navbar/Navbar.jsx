import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import './Navbar.css';

// Persistent navigation bar shown on every view. Uses React Router's
// <Link> / <NavLink> so navigation never triggers a full page reload.
export default function Navbar() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = () => {
    dispatch({ type: 'LOGOUT' });
    closeMenu();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? 'navbar-link navbar-link-active' : 'navbar-link';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          RICHFIELD CONNECT
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        <nav className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
          <NavLink to="/" className={navLinkClass} onClick={closeMenu} end>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass} onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/feed" className={navLinkClass} onClick={closeMenu}>
            Feed
          </NavLink>
          {state.user ? (
            <>
              <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                Profile
              </NavLink>
              <button type="button" className="navbar-link navbar-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : state.account ? (
            <NavLink to="/login" className={navLinkClass} onClick={closeMenu}>
              Sign In
            </NavLink>
          ) : (
            <NavLink to="/signup" className={navLinkClass} onClick={closeMenu}>
              Sign Up
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
