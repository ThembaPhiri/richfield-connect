import { createContext, useContext, useEffect, useReducer } from 'react';

// ---------------------------------------------------------------------------
// Global application state for Richfield Connect.
// Holds two things: the registered user's profile, and the community posts.
// Both are hydrated from localStorage on mount and re-synced whenever they
// change, so the app "remembers" the student between visits/reloads
// without any backend or database.
// ---------------------------------------------------------------------------

const USER_KEY = 'richfield_user';
const POSTS_KEY = 'richfield_posts';

const AppContext = createContext(null);

const initialState = {
  user: null,
  posts: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Loads whatever was previously saved in localStorage, if anything.
      return {
        ...state,
        user: action.payload.user ?? null,
        posts: action.payload.posts ?? [],
      };
    }

    case 'REGISTER_USER': {
      return {
        ...state,
        user: action.payload,
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
      const savedUser = JSON.parse(localStorage.getItem(USER_KEY));
      const savedPosts = JSON.parse(localStorage.getItem(POSTS_KEY));
      dispatch({
        type: 'HYDRATE',
        payload: { user: savedUser, posts: savedPosts },
      });
    } catch (err) {
      // Corrupted or missing localStorage data — start from a clean slate.
      console.warn('Could not read saved Richfield Connect data:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep localStorage in sync with the user profile.
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    }
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
