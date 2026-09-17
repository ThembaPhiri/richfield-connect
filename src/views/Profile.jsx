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
