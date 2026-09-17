import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import './Login.css';

// Login view — checks entered credentials against the stored account
// and activates a session if they match. This is a
// client-only check against localStorage, not real server authentication.
export default function Login() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!state.account) {
      setError('No account found on this device yet. Please sign up first.');
      return;
    }

    if (state.account.email !== email.trim()) {
      setError('No account matches that email.');
      return;
    }

    if (state.account.password !== password) {
      setError('Incorrect password.');
      return;
    }

    const { password: _pw, ...publicProfile } = state.account;
    dispatch({ type: 'LOGIN', payload: publicProfile });
    navigate('/profile');
  };

  return (
    <div className="page-container login-page">
      <div className="card login-card">
        <h1 className="page-heading">Welcome back.</h1>
        <p className="login-subtitle">Sign in to continue to your Richfield Connect profile.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError('');
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
            />
          </div>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn-primary login-submit">
            Sign In
          </button>
        </form>

        <p className="login-footer">
          Don't have an account yet? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
