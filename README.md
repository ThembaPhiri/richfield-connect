Richfield Connect — Premium React SPA

## Application Description

Richfield Connect is a React Single-Page Application built for Richfield
Graduate Institute of Technology, positioned as a digital academic commons
where students create a profile, share posts, and engage with the
community through likes and comments. It runs entirely in the browser —
no backend, database, or server-side code — with all data persisted via
`localStorage`.

## Component Architecture

- **`App.jsx`** — root component; wraps the app in `AppProvider` and defines routes.
- **`context/AppContext.jsx`** — global state via Context API + `useReducer`, holding `user` and `posts`. Actions: `REGISTER_USER`, `ADD_POST`, `TOGGLE_LIKE`, `DELETE_POST`. Hydrates from and syncs to `localStorage` via `useEffect`.
- **`components/Navbar`** — persistent navigation using React Router `<Link>`/`<NavLink>`, with a responsive mobile toggle.
- **`components/Footer`** — persistent footer with institutional info and links.
- **`views/Home.jsx`** — hero, slogan, three feature cards, Register CTA.
- **`views/About.jsx`** — platform purpose and the five-principle Academic Community Charter.
- **`views/SignUp.jsx`** — composes `SignUpForm` and `ProfilePreview` side by side.
- **`components/SignUpForm`** — controlled registration form with per-field `onBlur` and on-submit validation, reporting live values up to `SignUp`.
- **`components/ProfilePreview`** — pure, props-driven live identity card.
- **`views/Profile.jsx`** — reads the registered user from global state; shows an empty state if none exists.
- **`views/Feed.jsx`** — renders `CreatePost` and the list of `Post` components from global state.
- **`components/CreatePost`** — controlled textarea; dispatches `ADD_POST`.
- **`components/Post`** — displays a single post; dispatches `TOGGLE_LIKE` and `DELETE_POST` (the latter behind `window.confirm`).

## Local Installation

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (typically `http://localhost:5173`).

## External Resources / Documentation Consulted

- React documentation — https://react.dev
- React Router v6 documentation — https://reactrouter.com
- MDN Web Docs — Web APIs (`localStorage`, `crypto.randomUUID`)
