import './ProfilePreview.css';

function getInitials(fullName) {
  if (!fullName) return '?';
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
}

// ProfilePreview — receives the in-progress sign-up data via props only
// (no independent state) and re-renders instantly as the student types,
// acting like a live preview of their Richfield identity card.
export default function ProfilePreview({ form }) {
  const hasContent = form.fullName || form.bio || form.campus || form.interests.length > 0;

  return (
    <div className="profile-preview card">
      <p className="preview-label">Live Preview</p>

      <div className="preview-avatar">{getInitials(form.fullName)}</div>

      <h3 className="preview-name">{form.fullName || 'Your Name'}</h3>
      <p className="preview-campus">{form.campus || 'Campus not selected yet'}</p>

      <p className="preview-bio">
        {form.bio || (hasContent ? 'Add a short bio to complete your profile.' : 'Your bio will appear here as you type.')}
      </p>

      {form.interests.length > 0 && (
        <div className="preview-tags">
          {form.interests.map((interest) => (
            <span className="preview-tag" key={interest}>
              {interest}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
