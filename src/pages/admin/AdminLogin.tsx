import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { bootstrapLocalAdmin, getSession, hasLocalAccounts, isSupabaseMode, signIn } from '../../services/authService';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (getSession()) return <Navigate to="/admin/dashboard" replace />;
  const supabase = isSupabaseMode();
  const bootstrap = !supabase && !hasLocalAccounts();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (bootstrap) {
        const ok = await bootstrapLocalAdmin(email, password);
        if (!ok) { setError('Could not create the admin account. Try again.'); return; }
        navigate('/admin/dashboard');
        return;
      }
      const err = await signIn(email, password);
      if (err) { setError('Sign-in failed. Check your email and password, then try again.'); return; }
      navigate('/admin/dashboard');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '8vh auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px' }}>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>PIXEL // CONTROL PLANE</div><h1 className="t-hlg">Admin Access</h1></div>
      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={submit} noValidate>
        <label className="t-caption" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Email</span>
          <input className="input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pixel.dev" />
        </label>
        <label className="t-caption" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Password</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <input className="input" type={showPw ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm" aria-pressed={showPw} aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>
        {error && <p className="t-body-sm" role="alert" style={{ color: 'var(--error)' }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>
          {busy ? 'Working…' : bootstrap ? 'Create Super Admin' : 'Sign in'}
        </button>
      </form>
      <div className="card" style={{ padding: 14 }}>
        <p className="t-caption" style={{ color: 'var(--text-secondary)' }}>
          {supabase
            ? 'Supabase mode: real accounts with server-side authorization. Roles (student / reviewer / content_admin / super_admin) are enforced by Row Level Security — the frontend only reflects them.'
            : 'DEV MODE (no backend configured): credentials stay hashed on this device and are NOT a security boundary. Configure VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and run supabase/schema.sql + migrations/0002 for real accounts and RLS enforcement.'}
        </p>
      </div>
    </div>
  );
}
