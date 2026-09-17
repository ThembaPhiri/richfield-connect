import { useState } from 'react';
import SignUpForm from '../components/SignUpForm/SignUpForm.jsx';
import ProfilePreview from '../components/ProfilePreview/ProfilePreview.jsx';
import './SignUp.css';

const EMPTY_FORM = {
  fullName: '',
  campus: '',
  bio: '',
  interests: [],
};

// SignUp view — two-part composition: the registration form as the
// primary area, and a live profile preview as the secondary area.
// The preview-relevant slice of form data lives here and flows down to
// both children via props, so there is no duplicated state.
export default function SignUp() {
  const [previewData, setPreviewData] = useState(EMPTY_FORM);

  return (
    <div className="page-container signup-page">
      <h1 className="page-heading">Create your academic identity.</h1>

      <div className="signup-grid">
        <div className="card signup-form-panel">
          <SignUpForm onChangeForm={setPreviewData} />
        </div>
        <ProfilePreview form={previewData} />
      </div>
    </div>
  );
}
