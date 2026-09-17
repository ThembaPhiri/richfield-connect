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
