import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './CreatePost.css';

// CreatePost — controlled textarea + Post button. Dispatches ADD_POST to
// global state (which also persists to localStorage) and clears itself
// immediately after a successful submission.
export default function CreatePost() {
  const { state, dispatch } = useApp();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setContent(event.target.value);
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (content.trim().length === 0) {
      setError('A post cannot be empty.');
      return;
    }

    const newPost = {
      id: crypto.randomUUID(),
      username: state.user.fullName,
      timestamp: new Date().toLocaleString(),
      content: content.trim(),
      likes: 0,
      liked: false,
    };

    dispatch({ type: 'ADD_POST', payload: newPost });
    setContent('');
  };

  return (
    <form className="create-post card" onSubmit={handleSubmit}>
      <textarea
        className={error ? 'invalid' : ''}
        placeholder="Share an idea, question or academic insight..."
        rows={3}
        value={content}
        onChange={handleChange}
      />
      {error && <p className="field-error">{error}</p>}
      <div className="create-post-actions">
        <button type="submit" className="btn-primary">
          Post
        </button>
      </div>
    </form>
  );
}
