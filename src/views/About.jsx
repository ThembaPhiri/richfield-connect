import './About.css';

// Community guidelines, framed as an "Academic Community Charter" per the
// creative brief, while still satisfying the minimum-five-guideline requirement.
const CHARTER = [
  {
    principle: 'Respect',
    body: 'Engage with fellow students and their ideas with courtesy, even in disagreement.',
  },
  {
    principle: 'Contribute',
    body: 'Share posts, questions and insights that add genuine value to the community.',
  },
  {
    principle: 'Integrity',
    body: 'Represent yourself honestly. Your profile and posts should reflect who you are.',
  },
  {
    principle: 'Collaborate',
    body: 'Support your peers — comment, engage and build on what others contribute.',
  },
  {
    principle: 'Responsibility',
    body: 'Take ownership of what you post and how it affects the wider community.',
  },
];

export default function About() {
  return (
    <div className="page-container about-page">
      <h1 className="page-heading">The principles behind the connection</h1>
      <p className="about-intro">
        Richfield Connect is an academic social-engagement environment built for the
        Richfield Graduate Institute of Technology student community. It exists so
        students can create an academic identity, share ideas, and build genuine
        academic networks in a structured, professional online space — a digital
        academic commons where students connect, contribute, and leave knowledge behind.
      </p>

      <h2 className="section-heading-left">Academic Community Charter</h2>
      <ol className="charter-list">
        {CHARTER.map((item, index) => (
          <li className="charter-item card" key={item.principle}>
            <span className="charter-number">{index + 1}</span>
            <div>
              <h3>{item.principle}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="contact-card card">
        <h2>Contact & Campus Information</h2>
        <p>
          <strong>Email:</strong> connect@richfield.ac.za
        </p>
        <p>
          <strong>Campus:</strong> Richfield Graduate Institute of Technology, Durban Campus
        </p>
      </div>
    </div>
  );
}
