import { useApp } from '../../context/AppContext.jsx';
import './Post.css';

// Post — a single feed contribution. Owns no state of its own; likes and
// deletes are dispatched straight to global state.
export default function Post({ post }) {
  const { dispatch } = useApp();

  const handleLike = () => {
    dispatch({ type: 'TOGGLE_LIKE', payload: post.id });
  };

  const handleDelete = () => {
    const confirmed = window.confirm('Delete this post? This cannot be undone.');
    if (confirmed) {
      dispatch({ type: 'DELETE_POST', payload: post.id });
    }
  };

  return (
    <article className="post card">
      <header className="post-header">
        <span className="post-username">{post.username}</span>
        <span className="post-timestamp">{post.timestamp}</span>
      </header>

      <p className="post-content">{post.content}</p>

      <footer className="post-footer">
        <button
          type="button"
          className={`post-like ${post.liked ? 'post-like-active' : ''}`}
          onClick={handleLike}
          aria-pressed={post.liked}
        >
          {post.liked ? '♥' : '♡'} {post.likes}
        </button>

        <button type="button" className="post-delete" onClick={handleDelete}>
          Delete
        </button>
      </footer>
    </article>
  );
}
