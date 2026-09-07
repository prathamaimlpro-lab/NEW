import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { bootstrapAdmin, getSession, hasAccounts, login } from '../../services/authService';
import { sbEnabled } from '../../services/supabaseRest';
import { Field, TextInput } from '../../components/admin/fields';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (getSession()) return <Navigate to="/admin/dashboard" replace />;
  const bootstrap = !hasAccounts();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (bootstrap) { const ok = await bootstrapAdmin(email, password); if (!ok) { setError('Bootstrap failed.'); return; } navigate('/admin/dashboard'); return; }
    const role = await login(email, password);
    if (!role) { setError('Invalid credentials.'); return; }
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ maxWidth: 420, margin: '8vh auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>IT QUEST // CONTROL PLANE</div><h1 className="t-hlg">Admin Access</h1></div>
      <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={submit}>
        <Field label="Email"><TextInput value={email} onChange={setEmail} placeholder="admin@itquest.dev" /></Field>
        <Field label="Password"><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} /></Field>
        {error && <p className="t-body-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        <button className="btn btn-primary" type="submit">{bootstrap ? 'Create Super Admin' : 'Sign in'}</button>
      </form>
      <div className="card" style={{ padding: 14 }}>
        <p className="t-caption" style={{ color: 'var(--fg-muted)' }}>
          {bootstrap ? 'First run: create the Super Admin account for this deployment. ' : ''}
          {sbEnabled()
            ? 'Supabase mode detected: sessions are validated by the backend and enforced with Row Level Security.'
            : 'Local mode: credentials are hashed and stored on this device for development. Production deployments must configure Supabase (see supabase/schema.sql) — the frontend is never the security boundary.'}
        </p>
      </div>
    </div>
  );
}
