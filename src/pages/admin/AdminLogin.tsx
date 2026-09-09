import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { bootstrapLocalAdmin, getSession, hasLocalAccounts, isSupabaseMode, signIn } from '../../services/authService';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (getSession()) return <Navigate to="/admin/dashboard" replace />;
  const supabase = isSupabaseMode();
  const bootstrap = !supabase && !hasLocalAccounts();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (bootstrap) {
      const ok = await bootstrapLocalAdmin(email, password);
      if (!ok) { setError('Bootstrap failed.'); return; }
      navigate('/admin/dashboard');
      return;
    }
    const err = await signIn(email, password);
    if (err) { setError(err); return; }
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ maxWidth: 420, margin: '8vh auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>IT QUEST // CONTROL PLANE</div><h1 className="t-hlg">Admin Access</h1></div>
      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={submit}>
        <label className="t-caption" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ color: 'var(--fg-2)' }}>Email</span>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@itquest.dev" /></label>
        <label className="t-caption" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ color: 'var(--fg-2)' }}>Password</span>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="t-body-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        <button className="btn btn-primary" type="submit">{bootstrap ? 'Create Super Admin' : 'Sign in'}</button>
      </form>
      <div className="card" style={{ padding: 14 }}>
        <p className="t-caption" style={{ color: 'var(--fg-2)' }}>
          {supabase
            ? 'Supabase mode: real accounts with server-side authorization. Roles (student / reviewer / content_admin / super_admin) are enforced by Row Level Security — the frontend only reflects them.'
            : 'DEV MODE (no backend configured): credentials stay hashed on this device and are NOT a security boundary. Configure VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and run supabase/schema.sql + migrations/0002 for real accounts and RLS enforcement.'}
        </p>
      </div>
    </div>
  );
}
