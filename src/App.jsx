import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import Home from './views/Home.jsx';
import About from './views/About.jsx';
import SignUp from './views/SignUp.jsx';
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
