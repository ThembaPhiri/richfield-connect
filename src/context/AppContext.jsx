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
