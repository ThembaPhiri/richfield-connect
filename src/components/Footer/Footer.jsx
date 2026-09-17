import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import './Footer.css';

// Persistent footer with institutional information and internal links.
export default function Footer() {
  const { state } = useApp();
  const { user, account } = state;
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">RICHFIELD CONNECT</p>
          <p className="footer-meta">
            Richfield Graduate Institute of Technology — The Campus, Connected.
          </p>
        </div>

        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/feed">Feed</Link>
          {user ? (
            <Link to="/profile">Profile</Link>
          ) : account ? (
            <Link to="/login">Sign In</Link>
          ) : (
            <Link to="/signup">Sign Up</Link>
          )}
        </nav>

        <p className="footer-copy">&copy; {year} Richfield Connect. All rights reserved.</p>
      </div>
    </footer>
  );
}
