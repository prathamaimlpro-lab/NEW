import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <span className="label-mono" style={{ color: 'var(--error)' }}>ERROR // 404</span>
      <h1 className="t-display">Route Not Mapped</h1>
      <p className="t-body-lg" style={{ maxWidth: 420 }}>The address you requested does not resolve to any known workspace.</p>
      <Link className="btn btn-primary" to="/">Return to Home</Link>
    </div>
  );
}
