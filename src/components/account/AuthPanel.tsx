import { FormEvent, useEffect, useState } from 'react';
import { getSession, isSupabaseMode, onAuthChange, resetPassword, signIn, signOut, signUp, type Session } from '../../services/authService';
import { Chip } from '../common/ui';

export function AuthPanel() {
  const [session, setSession] = useState<Session | null>(getSession());
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => onAuthChange(setSession), []);
  if (!isSupabaseMode()) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    if (mode === 'signin') { const err = await signIn(email, password); setMsg(err ?? 'Signed in.'); }
    if (mode === 'signup') { const err = await signUp(email, password); setMsg(err ?? 'Account created. Check your email if verification is enabled, then sign in.'); }
    if (mode === 'reset') { const err = await resetPassword(email); setMsg(err ?? 'Password reset email sent.'); }
  };

  if (session) {
    return (
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="label-mono">ACCOUNT</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="t-body" style={{ color: 'var(--fg-0)' }}>{session.email}</span>
          <Chip tone="info">{session.role}</Chip>
          <Chip tone="success">SYNCED VIA SUPABASE</Chip>
        </div>
        <p className="t-caption">Progress, XP, streaks, favourites and notes are stored server-side and follow you across devices.</p>
        <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => { void signOut(); }}>Sign out</button>
      </section>
    );
  }

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="label-mono">ACCOUNT</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['signin', 'signup', 'reset'] as const).map(m => (
          <button key={m} className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode(m)}>
            {m === 'signin' ? 'Sign in' : m === 'signup' ? 'Create account' : 'Reset password'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        {mode !== 'reset' && <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />}
        <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }}>
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset email'}
        </button>
      </form>
      {msg && <p className="t-body-sm" style={{ color: 'var(--fg-1)' }}>{msg}</p>}
    </section>
  );
}
