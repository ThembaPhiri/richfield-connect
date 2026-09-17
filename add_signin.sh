#!/bin/bash
set -e

cat > 'src/context/AppContext.jsx' << 'RCEOF'
import { createContext, useContext, useEffect, useReducer } from 'react';

// ---------------------------------------------------------------------------
// Global application state for Richfield Connect.
//
// Two related but distinct pieces of user data are kept:
//   - "account": the full registered profile, INCLUDING the password.
//     Created once at sign-up and persisted permanently in localStorage.
//   - "user": the public, active-session profile (no password) — this is
//     what the rest of the app reads to know "is someone logged in?" and
//     what to display. It's null whenever nobody is signed in.
//
// This split is what makes Sign Out + Sign In possible: signing out clears
// "user" (ends the session) but keeps "account" (so you can log back in
// without re-registering).
//
// IMPORTANT: this is a client-only demo with no backend or database, so the
// password is stored in plain text in localStorage purely so this login
// form has something to check against. This is NOT how real authentication
// works — a real app verifies credentials against a server, and never
// stores or compares passwords in plain text.
// ---------------------------------------------------------------------------

const ACCOUNT_KEY = 'richfield_account';
const SESSION_KEY = 'richfield_session';
const POSTS_KEY = 'richfield_posts';

const AppContext = createContext(null);

const initialState = {
  account: null,
  user: null,
  posts: [],
};

// Strips the password out of a full account object before it's exposed
// anywhere as the active "user" (rendered in the UI, passed to components).
function toPublicProfile(account) {
  if (!account) return null;
  const { password, ...publicProfile } = account;
  return publicProfile;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Loads whatever was previously saved in localStorage, if anything.
      return {
        ...state,
        account: action.payload.account ?? null,
        user: action.payload.user ?? null,
        posts: action.payload.posts ?? [],
      };
    }

    case 'REGISTER_USER': {
      // Registering creates the permanent account AND logs the student in
      // immediately (their new profile becomes the active session).
      return {
        ...state,
        account: action.payload,
        user: toPublicProfile(action.payload),
      };
    }

    case 'LOGIN': {
      // The Login view already validated credentials against state.account
      // before dispatching this — this just activates the session.
      return {
        ...state,
        user: action.payload,
      };
    }

    case 'LOGOUT': {
      // Ends the session but keeps the account, so the student can log
      // back in later.
      return {
        ...state,
        user: null,
      };
    }

    case 'ADD_POST': {
      // New posts go to the top of the feed.
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    }

    case 'TOGGLE_LIKE': {
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.payload
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        ),
      };
    }

    case 'DELETE_POST': {
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== action.payload),
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved data once, when the app first mounts.
  useEffect(() => {
    try {
      const savedAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY));
      const hadSession = JSON.parse(localStorage.getItem(SESSION_KEY));
      const savedPosts = JSON.parse(localStorage.getItem(POSTS_KEY));

      dispatch({
        type: 'HYDRATE',
        payload: {
          account: savedAccount,
          // Only restore an active session if one was in progress AND the
          // account still exists (e.g. wasn't cleared some other way).
          user: hadSession && savedAccount ? toPublicProfile(savedAccount) : null,
          posts: savedPosts,
        },
      });
    } catch (err) {
      // Corrupted or missing localStorage data — start from a clean slate.
      console.warn('Could not read saved Richfield Connect data:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep localStorage in sync with the permanent account.
  useEffect(() => {
    if (state.account) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(state.account));
    }
  }, [state.account]);

  // Keep localStorage in sync with whether a session is currently active.
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(!!state.user));
  }, [state.user]);

  // Keep localStorage in sync with the posts array.
  useEffect(() => {
    localStorage.setItem(POSTS_KEY, JSON.stringify(state.posts));
  }, [state.posts]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook so components can simply call useApp() instead of importing
// useContext + AppContext everywhere.
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
RCEOF

cat > 'src/components/SignUpForm/SignUpForm.jsx' << 'RCEOF'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import './SignUpForm.css';

const CAMPUSES = ['Durban', 'Cape Town', 'Johannesburg', 'Pretoria', 'Nelspruit'];
const INTERESTS = [
  'Software Engineering',
  'Data Science',
  'Design',
  'Business & Entrepreneurship',
  'Robotics',
  'Cybersecurity',
];

const INITIAL_FORM = {
  fullName: '',
  studentNumber: '',
  campus: '',
  email: '',
  password: '',
  confirmPassword: '',
  interests: [],
  bio: '',
  terms: false,
};

// Validates a single field. Returns an error string, or '' if valid.
function validateField(name, value, formState) {
  switch (name) {
    case 'fullName':
      return value.trim().length === 0 ? 'Full name is required.' : '';

    case 'studentNumber':
      if (value.trim().length === 0) return 'Student number is required.';
      if (!/^\d+$/.test(value)) return 'Student number must contain digits only.';
      if (value.trim().length < 6) return 'Student number must contain at least 6 digits.';
      return '';

    case 'campus':
      return value === '' ? 'Please select your campus.' : '';

    case 'email':
      if (value.trim().length === 0) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
      return '';

    case 'password':
      return value.length < 8 ? 'Password must be at least 8 characters.' : '';

    case 'confirmPassword':
      return value !== formState.password ? 'Passwords do not match.' : '';

    case 'interests':
      return value.length === 0 ? 'Select at least one interest.' : '';

    case 'bio':
      return value.trim().length < 20 ? 'Bio must be at least 20 characters.' : '';

    case 'terms':
      return value === false ? 'You must accept the Terms & Conditions.' : '';

    default:
      return '';
  }
}

// SignUpForm — controlled registration form with real-time (onBlur) and
// on-submit validation. Reports live form state up to the SignUp view via
// onChangeForm so <ProfilePreview /> can render it without duplicated state.
export default function SignUpForm({ onChangeForm }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const updateForm = (next) => {
    setForm(next);
    onChangeForm(next);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextForm = { ...form, [name]: type === 'checkbox' ? checked : value };
    updateForm(nextForm);

    // Clear the error immediately once the field becomes valid again.
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextForm[name], nextForm) }));
    }
  };

  const handleInterestToggle = (interest) => {
    const nextInterests = form.interests.includes(interest)
      ? form.interests.filter((item) => item !== interest)
      : [...form.interests, interest];
    const nextForm = { ...form, interests: nextInterests };
    updateForm(nextForm);
    if (touched.interests) {
      setErrors((prev) => ({ ...prev, interests: validateField('interests', nextInterests, nextForm) }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fieldNames = Object.keys(INITIAL_FORM);
    const nextErrors = {};
    fieldNames.forEach((name) => {
      nextErrors[name] = validateField(name, form[name], form);
    });
    setErrors(nextErrors);
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    const hasErrors = Object.values(nextErrors).some((message) => message !== '');
    if (hasErrors) return;

    dispatch({
      type: 'REGISTER_USER',
      payload: {
        fullName: form.fullName.trim(),
        studentNumber: form.studentNumber.trim(),
        campus: form.campus,
        email: form.email.trim(),
        password: form.password,
        interests: form.interests,
        bio: form.bio.trim(),
      },
    });

    navigate('/profile');
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.fullName ? 'invalid' : ''}
        />
        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
      </div>

      <div className="field">
        <label htmlFor="studentNumber">Student Number</label>
        <input
          id="studentNumber"
          name="studentNumber"
          type="text"
          inputMode="numeric"
          value={form.studentNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.studentNumber ? 'invalid' : ''}
        />
        {errors.studentNumber && <p className="field-error">{errors.studentNumber}</p>}
      </div>

      <div className="field">
        <label htmlFor="campus">Campus</label>
        <select
          id="campus"
          name="campus"
          value={form.campus}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.campus ? 'invalid' : ''}
        >
          <option value="">Select your campus</option>
          {CAMPUSES.map((campus) => (
            <option key={campus} value={campus}>
              {campus}
            </option>
          ))}
        </select>
        {errors.campus && <p className="field-error">{errors.campus}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'invalid' : ''}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password ? 'invalid' : ''}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.confirmPassword ? 'invalid' : ''}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
      </div>

      <div className="field">
        <label>Interests</label>
        <div className="checkbox-group">
          {INTERESTS.map((interest) => (
            <label className="checkbox-option" key={interest}>
              <input
                type="checkbox"
                checked={form.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, interests: true }));
                  setErrors((prev) => ({
                    ...prev,
                    interests: validateField('interests', form.interests, form),
                  }));
                }}
              />
              {interest}
            </label>
          ))}
        </div>
        {errors.interests && <p className="field-error">{errors.interests}</p>}
      </div>

      <div className="field">
        <label htmlFor="bio">Short Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.bio ? 'invalid' : ''}
        />
        {errors.bio && <p className="field-error">{errors.bio}</p>}
      </div>

      <div className="field">
        <label className="checkbox-option">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          I agree to the Terms & Conditions
        </label>
        {errors.terms && <p className="field-error">{errors.terms}</p>}
      </div>

      <button type="submit" className="btn-primary signup-submit">
        Register
      </button>
    </form>
  );
}
RCEOF

cat > 'src/components/Navbar/Navbar.jsx' << 'RCEOF'
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
RCEOF

cat > 'src/components/Navbar/Navbar.css' << 'RCEOF'
.navbar {
  background: var(--rc-blue);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  color: var(--rc-white);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-decoration: none;
  font-size: 18px;
}

.navbar-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--rc-white);
  font-size: 22px;
}

.navbar-links {
  display: flex;
  gap: var(--space-3);
}

.navbar-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.navbar-link:hover {
  color: var(--rc-white);
}

.navbar-link-active {
  color: var(--rc-white);
  border-bottom-color: var(--rc-white);
}

.navbar-signout {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  padding-bottom: 4px;
}

@media (max-width: 767px) {
  .navbar-toggle {
    display: block;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--rc-blue);
    flex-direction: column;
    padding: var(--space-2) var(--space-3) var(--space-3);
    gap: var(--space-2);
  }

  .navbar-links-open {
    display: flex;
  }
}
RCEOF

cat > 'src/views/Login.jsx' << 'RCEOF'
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
RCEOF

cat > 'src/views/Login.css' << 'RCEOF'
.login-page {
  max-width: 440px;
}

.login-card {
  padding: var(--space-4);
}

.login-subtitle {
  margin-bottom: var(--space-3);
}

.login-submit {
  width: 100%;
  border: none;
  margin-top: var(--space-1);
}

.login-footer {
  text-align: center;
  margin: var(--space-3) 0 0 0;
  font-size: 14px;
}
RCEOF

cat > 'src/views/Profile.jsx' << 'RCEOF'
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import './Profile.css';

function getInitials(fullName) {
  if (!fullName) return '?';
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}

// Profile view — dynamically renders the registered student's data from
// global state (hydrated from localStorage). No student data is ever
// hardcoded here.
export default function Profile() {
  const { state } = useApp();
  const { user, account, posts } = state;

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          {account ? (
            <>
              <h3>You're signed out.</h3>
              <p>Sign in to see your Richfield Connect profile.</p>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
            </>
          ) : (
            <>
              <h3>Your academic profile starts here.</h3>
              <p>Create your Richfield Connect profile to join the community.</p>
              <Link to="/signup" className="btn-primary">
                Create your profile
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const postCount = posts.filter((post) => post.username === user.fullName).length;

  return (
    <div className="page-container profile-page">
      <div className="card profile-card">
        <div className="profile-avatar">{getInitials(user.fullName)}</div>
        <h1>{user.fullName}</h1>
        <p className="profile-campus">{user.campus}</p>

        <div className="profile-stats">
          <div>
            <strong>{postCount}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Connections</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Groups</span>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Student Number</dt>
            <dd>{user.studentNumber}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Bio</dt>
            <dd>{user.bio}</dd>
          </div>
        </dl>

        {user.interests.length > 0 && (
          <div className="profile-tags">
            {user.interests.map((interest) => (
              <span className="preview-tag" key={interest}>
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
RCEOF

cat > 'src/views/Feed.jsx' << 'RCEOF'
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import CreatePost from '../components/CreatePost/CreatePost.jsx';
import Post from '../components/Post/Post.jsx';
import './Feed.css';

// Feed view — the central interactive component. Renders CreatePost (only
// for a registered user) and the list of Post components from global state.
export default function Feed() {
  const { state } = useApp();
  const { user, account, posts } = state;

  return (
    <div className="page-container feed-page">
      <h1 className="page-heading">What's moving through the community.</h1>

      {user ? (
        <CreatePost />
      ) : (
        <div className="card feed-signin-prompt">
          {account ? (
            <>
              <p>Sign in to share your own posts with the community.</p>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
            </>
          ) : (
            <>
              <p>Register to share your own posts with the community.</p>
              <Link to="/signup" className="btn-primary">
                Create your profile
              </Link>
            </>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="empty-state card">
          <h3>The conversation starts with you.</h3>
          <p>Share an idea, question or academic insight.</p>
        </div>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
RCEOF

cat > 'src/App.jsx' << 'RCEOF'
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Home from './views/Home.jsx';
import About from './views/About.jsx';
import SignUp from './views/SignUp.jsx';
import Login from './views/Login.jsx';
import Profile from './views/Profile.jsx';
import Feed from './views/Feed.jsx';

// Root component. Global state comes from AppProvider (see main.jsx).
// This component just owns the persistent shell (Navbar + Footer) and
// the route table for the five required views.
export default function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Navbar />
      {/* key={pathname} forces a remount on route change, which re-triggers
          the .route-fade entrance animation for each view. */}
      <main className="app-main route-fade" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
RCEOF

echo "Sign-in feature added."
