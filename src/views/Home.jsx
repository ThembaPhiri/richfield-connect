import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  {
    step: '01',
    title: 'Connect',
    body: 'Create your academic identity and find your place among the Richfield student community.',
  },
  {
    step: '02',
    title: 'Contribute',
    body: 'Share ideas, questions and academic insight through posts the whole community can see.',
  },
  {
    step: '03',
    title: 'Grow',
    body: 'Engage with what others contribute and build a network that grows with your studies.',
  },
];

// Home view — hero, slogan, feature progression, and the Register CTA.
export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="page-container hero-inner">
          <p className="hero-eyebrow">THE CAMPUS, CONNECTED.</p>
          <h1 className="hero-title">RICHFIELD CONNECT</h1>
          <p className="hero-subtitle">
            A digital academic community where students connect, contribute and grow.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">
              Register Now
            </Link>
            <Link to="/feed" className="btn-secondary">
              Explore the community →
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container">
        <h2 className="section-heading">Where student ideas become part of the community</h2>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <div className="feature-card card" key={feature.step}>
              <span className="feature-step">{feature.step}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
