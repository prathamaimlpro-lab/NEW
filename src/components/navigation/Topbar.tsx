import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatWhen, selectWhatChangedInsights } from '../../dashboard/changeSelectors';
import { getSession, signOut } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { usePlayer } from '../../store/PlayerContext';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';
import { QuickFind } from './QuickFind';

const SEEN_KEY = 'pixel_notif_seen';
const LABELS: [string, string][] = [
  ['/learn/lesson', 'LESSON'], ['/learn/level', 'LEVEL'], ['/learn', 'CURRICULUM'],
  ['/practice/problems', 'PROBLEM'], ['/practice', 'PRACTICE'], ['/progress', 'PROGRESS'],
  ['/projects', 'PROJECTS'], ['/graph', 'KNOWLEDGE GRAPH'], ['/books', 'BOOKS'], ['/community', 'COMMUNITY'],
  ['/settings', 'SETTINGS'], ['/explore/viz', 'VISUALIZATION LAB'], ['/explore', 'EXPLORE'], ['/', 'LEARNING OS'],
];

export function Topbar() {
  const { stats } = usePlayer();
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const userRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const routeLabel = LABELS.find(([p]) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))?.[1] ?? 'LEARNING OS';
  const insights = selectWhatChangedInsights(stats);
  const seen = storageService.get<string>(SEEN_KEY, '');
  const unread = insights.filter(i => i.when > seen).length;
  const session = getSession();
  const isAdmin = session && (session.role === 'super_admin' || session.role === 'content_admin');

  useEffect(() => {
    if (!bellOpen && !userOpen) return;
    popRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setBellOpen(false); setUserOpen(false); bellRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bellOpen, userOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (document.querySelector('.tb-search button') as HTMLButtonElement | null)?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openBell = () => {
    const next = !bellOpen;
    setBellOpen(next); setUserOpen(false);
    if (next) storageService.set(SEEN_KEY, new Date().toISOString());
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, color: 'var(--text-primary)' }}>
        <PixelWordmark size={11} />
        <span style={{ color: 'var(--text-subtle)' }} aria-hidden="true">/</span>
        <span className="label-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routeLabel}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="tb-search"><QuickFind /></div>

        <div style={{ position: 'relative' }}>
          <button ref={bellRef} type="button" className="btn btn-ghost btn-icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={bellOpen} aria-haspopup="dialog" onClick={openBell}>
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="tb-badge" aria-hidden="true">{unread}</span>}
          </button>
          {bellOpen && (
            <>
              <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close notifications" onClick={() => setBellOpen(false)} />
              <div ref={popRef} tabIndex={-1} role="dialog" aria-label="Notifications" className="dialog" style={{ position: 'absolute', right: 0, top: 44, width: 300, zIndex: 56, padding: 12 }}>
                <div className="label-mono" style={{ padding: '4px 8px 8px' }}>What changed</div>
                {insights.length === 0 && <p className="t-body-sm" style={{ padding: 8, color: 'var(--text-secondary)' }}>No progress changes yet.</p>}
                {insights.slice(0, 6).map(i => (
                  <div key={i.id} style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>{i.title}</span>
                    <span className="ui-mono">{formatWhen(i.when)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button ref={userRef} type="button" className="tb-user" aria-expanded={userOpen} aria-haspopup="menu" onClick={() => { setUserOpen(v => !v); setBellOpen(false); }}>
            <span className="avatar" aria-hidden="true"><Icon name="profile" size={16} /></span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
              <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>{session?.email ? session.email.split('@')[0] : 'Learner'}</span>
              <span className="ui-mono">Lv {stats.level} · {stats.xp.toLocaleString()} XP</span>
            </span>
            <Icon name="progress" size={12} />
          </button>
          {userOpen && (
            <>
              <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close menu" onClick={() => setUserOpen(false)} />
              <div ref={popRef} tabIndex={-1} role="menu" aria-label="Account" className="dialog" style={{ position: 'absolute', right: 0, top: 48, width: 200, zIndex: 56, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link role="menuitem" className="sb-tool" to="/profile">Profile</Link>
                <Link role="menuitem" className="sb-tool" to="/settings">Settings</Link>
                {isAdmin && <Link role="menuitem" className="sb-tool" to="/admin/dashboard">Admin</Link>}
                {session && (
                  <button role="menuitem" type="button" className="sb-tool" onClick={async () => { await signOut(); setUserOpen(false); }}>Sign out</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
