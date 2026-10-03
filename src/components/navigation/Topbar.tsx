import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { formatWhen, selectWhatChangedInsights } from '../../dashboard/changeSelectors';
import { getSession, signOut } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { usePlayer } from '../../store/PlayerContext';
import { AppLauncher } from './AppLauncher';
import { Icon } from '../common/Icon';
import { QuickFind } from './QuickFind';

const SEEN_KEY = 'pixel_notif_seen';
const TITLES: [string, string][] = [
  ['/learn/lesson', 'Lesson'], ['/learn/level', 'Level'], ['/learn', 'Curriculum'],
  ['/practice/problems', 'Problem'], ['/practice', 'Practice'], ['/coding', 'Pixel Code'],
  ['/progress', 'Progress'], ['/projects', 'Projects'], ['/graph', 'Knowledge graph'],
  ['/books', 'Books'], ['/community', 'Community'], ['/settings', 'Settings'],
  ['/explore/viz', 'Visualization Lab'], ['/explore', 'Visualizations'], ['/profile', 'Profile'], ['/', 'Home'],
];

export function Topbar() {
  const { stats } = usePlayer();
  const [bellOpen, setBellOpen] = useState(false);
  const [ringOpen, setRingOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const title = TITLES.find(([p]) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))?.[1] ?? 'Pixel';
  const insights = selectWhatChangedInsights(stats);
  const seen = storageService.get<string>(SEEN_KEY, '');
  const unread = insights.filter(i => i.when > seen).length;
  const session = getSession();
  const isAdmin = session && (session.role === 'super_admin' || session.role === 'content_admin');

  useEffect(() => {
    if (!bellOpen && !ringOpen) return;
    popRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setBellOpen(false); setRingOpen(false); bellRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bellOpen, ringOpen]);

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
    setBellOpen(next); setRingOpen(false);
    if (next) storageService.set(SEEN_KEY, new Date().toISOString());
  };

  return (
    <header className="topbar">
      <h1 className="tb-title">{title}</h1>
      <div className="tb-right">
        <div className="tb-search"><QuickFind /></div>
        <AppLauncher />
        <div style={{ position: 'relative' }}>
          <button ref={bellRef} type="button" className="btn btn-ghost btn-icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={bellOpen} aria-haspopup="dialog" onClick={openBell}>
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="tb-badge" aria-hidden="true">{unread}</span>}
          </button>
          {bellOpen && (
            <>
              <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close notifications" onClick={() => setBellOpen(false)} />
              <div ref={popRef} tabIndex={-1} role="dialog" aria-label="Notifications" className="dialog" style={{ position: 'absolute', right: 0, top: 44, width: 300, zIndex: 56, padding: 12 }}>
                <div className="ui-index" style={{ padding: '4px 8px 8px' }}>What changed</div>
                {insights.length === 0 && <p className="ui-desc" style={{ padding: 8 }}>No progress changes yet.</p>}
                {insights.slice(0, 6).map(i => (
                  <div key={i.id} style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{i.title}</span>
                    <span className="ui-mono">{formatWhen(i.when)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button ref={ringRef} type="button" className="level-ring" aria-label={`Level ${stats.level}. Open account menu`} aria-expanded={ringOpen} aria-haspopup="menu" onClick={() => { setRingOpen(v => !v); setBellOpen(false); }}>
            {stats.level}
          </button>
          {ringOpen && (
            <>
              <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close menu" onClick={() => setRingOpen(false)} />
              <div ref={popRef} tabIndex={-1} role="menu" aria-label="Account" className="dialog" style={{ position: 'absolute', right: 0, top: 40, width: 200, zIndex: 56, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="ui-index" style={{ padding: '4px 10px' }}>Level {stats.level} · {stats.xp.toLocaleString()} XP</div>
                <Link role="menuitem" className="sb-tool" to="/profile">Profile</Link>
                <Link role="menuitem" className="sb-tool" to="/settings">Settings</Link>
                {isAdmin && <Link role="menuitem" className="sb-tool" to="/admin/dashboard">Admin</Link>}
                {session && <button role="menuitem" type="button" className="sb-tool" onClick={async () => { await signOut(); setRingOpen(false); }}>Sign out</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
