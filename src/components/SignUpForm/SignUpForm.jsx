import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import './SignUpForm.css';

const CAMPUSES = ['Durban', 'Cape Town', 'Johannesburg', 'Pretoria', 'Nelspruit'];
const INTERESTS = [
  'Software Engineering',
  'Data Science',
  'Design',
  'Business & Entrepreneurship',
  'Robotics',
  'Cybersecurity',
];

const INITIAL_FORM = {
  fullName: '',
  studentNumber: '',
  campus: '',
  email: '',
  password: '',
  confirmPassword: '',
  interests: [],
  bio: '',
  terms: false,
};

// Validates a single field. Returns an error string, or '' if valid.
function validateField(name, value, formState) {
  switch (name) {
    case 'fullName':
      return value.trim().length === 0 ? 'Full name is required.' : '';

    case 'studentNumber':
      if (value.trim().length === 0) return 'Student number is required.';
      if (!/^\d+$/.test(value)) return 'Student number must contain digits only.';
      if (value.trim().length < 6) return 'Student number must contain at least 6 digits.';
      return '';

    case 'campus':
      return value === '' ? 'Please select your campus.' : '';

    case 'email':
      if (value.trim().length === 0) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
      return '';

    case 'password':
      return value.length < 8 ? 'Password must be at least 8 characters.' : '';

    case 'confirmPassword':
      return value !== formState.password ? 'Passwords do not match.' : '';

    case 'interests':
      return value.length === 0 ? 'Select at least one interest.' : '';

    case 'bio':
      return value.trim().length < 20 ? 'Bio must be at least 20 characters.' : '';

    case 'terms':
      return value === false ? 'You must accept the Terms & Conditions.' : '';

    default:
      return '';
  }
}

// SignUpForm — controlled registration form with real-time (onBlur) and
// on-submit validation. Reports live form state up to the SignUp view via
// onChangeForm so <ProfilePreview /> can render it without duplicated state.
export default function SignUpForm({ onChangeForm }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const updateForm = (next) => {
    setForm(next);
    onChangeForm(next);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextForm = { ...form, [name]: type === 'checkbox' ? checked : value };
    updateForm(nextForm);

    // Clear the error immediately once the field becomes valid again.
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextForm[name], nextForm) }));
    }
  };

  const handleInterestToggle = (interest) => {
    const nextInterests = form.interests.includes(interest)
      ? form.interests.filter((item) => item !== interest)
      : [...form.interests, interest];
    const nextForm = { ...form, interests: nextInterests };
    updateForm(nextForm);
    if (touched.interests) {
      setErrors((prev) => ({ ...prev, interests: validateField('interests', nextInterests, nextForm) }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fieldNames = Object.keys(INITIAL_FORM);
    const nextErrors = {};
    fieldNames.forEach((name) => {
      nextErrors[name] = validateField(name, form[name], form);
    });
    setErrors(nextErrors);
    setTouched(fieldNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

    const hasErrors = Object.values(nextErrors).some((message) => message !== '');
    if (hasErrors) return;

    dispatch({
      type: 'REGISTER_USER',
      payload: {
        fullName: form.fullName.trim(),
        studentNumber: form.studentNumber.trim(),
        campus: form.campus,
        email: form.email.trim(),
        password: form.password,
        interests: form.interests,
        bio: form.bio.trim(),
      },
    });

    navigate('/profile');
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.fullName ? 'invalid' : ''}
        />
        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
      </div>

      <div className="field">
        <label htmlFor="studentNumber">Student Number</label>
        <input
          id="studentNumber"
          name="studentNumber"
          type="text"
          inputMode="numeric"
          value={form.studentNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.studentNumber ? 'invalid' : ''}
        />
        {errors.studentNumber && <p className="field-error">{errors.studentNumber}</p>}
      </div>

      <div className="field">
        <label htmlFor="campus">Campus</label>
        <select
          id="campus"
          name="campus"
          value={form.campus}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.campus ? 'invalid' : ''}
        >
          <option value="">Select your campus</option>
          {CAMPUSES.map((campus) => (
            <option key={campus} value={campus}>
              {campus}
            </option>
          ))}
        </select>
        {errors.campus && <p className="field-error">{errors.campus}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email ? 'invalid' : ''}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.password ? 'invalid' : ''}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.confirmPassword ? 'invalid' : ''}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
      </div>

      <div className="field">
        <label>Interests</label>
        <div className="checkbox-group">
          {INTERESTS.map((interest) => (
            <label className="checkbox-option" key={interest}>
              <input
                type="checkbox"
                checked={form.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, interests: true }));
                  setErrors((prev) => ({
                    ...prev,
                    interests: validateField('interests', form.interests, form),
                  }));
                }}
              />
              {interest}
            </label>
          ))}
        </div>
        {errors.interests && <p className="field-error">{errors.interests}</p>}
      </div>

      <div className="field">
        <label htmlFor="bio">Short Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.bio ? 'invalid' : ''}
        />
        {errors.bio && <p className="field-error">{errors.bio}</p>}
      </div>

      <div className="field">
        <label className="checkbox-option">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          I agree to the Terms & Conditions
        </label>
        {errors.terms && <p className="field-error">{errors.terms}</p>}
      </div>

      <button type="submit" className="btn-primary signup-submit">
        Register
      </button>
    </form>
  );
}
