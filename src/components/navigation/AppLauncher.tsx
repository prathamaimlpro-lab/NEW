import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/launcher.css';

const LearnIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 5h9a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4z" /><path d="M20 5h-4v12h4z" /></svg>);
const CodeIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></svg>);
const BuildIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="12" r="2.5" /><path d="M6 8.5v7M8.5 6.5C12 8 12 10 15.5 11.5" /></svg>);
const NotesIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7" /></svg>);
const SocialIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 19c1-3.5 3.5-5 6-5s5 1.5 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14c2.5 0 4.5 1.5 5 4" /></svg>);
const WaffleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {[5, 12, 19].map(y => [5, 12, 19].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />))}
  </svg>
);

interface SuiteItem { to: string; label: string; sub: string; icon: React.ReactNode; enabled: boolean }

const SUITE: SuiteItem[] = [
  { to: '/', label: 'Learn', sub: 'Curriculum, lessons, graph', icon: <LearnIcon />, enabled: true },
  { to: '/coding', label: 'Code', sub: 'Problems & native runner', icon: <CodeIcon />, enabled: true },
  { to: '/build', label: 'Build', sub: 'Your solution repos', icon: <BuildIcon />, enabled: false },
  { to: '/notes', label: 'Notes', sub: 'Personal knowledge vault', icon: <NotesIcon />, enabled: false },
  { to: '/community', label: 'Social', sub: 'Learner community', icon: <SocialIcon />, enabled: false },
];

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a,button:not([disabled])')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (item: SuiteItem) =>
    item.to === '/' ? !pathname.startsWith('/coding') : pathname.startsWith(item.to);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="waffle"
        aria-label="Switch Pixel workspace"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(v => !v)}
      >
        <WaffleIcon />
      </button>

      {open && (
        <>
          <button type="button" className="dialog-scrim" style={{ zIndex: 55, background: 'transparent' }} aria-label="Close workspace switcher" onClick={() => { setOpen(false); btnRef.current?.focus(); }} />
          <div ref={panelRef} className="launcher" role="dialog" aria-label="Pixel workspaces">
            <div className="launcher-head">
              <span className="ui-index">Pixel Suite</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); btnRef.current?.focus(); }} aria-label="Close">✕</button>
            </div>
            <div className="launcher-grid">
              {SUITE.map(item => item.enabled ? (
                <Link key={item.to} className={`launcher-tile ${isActive(item) ? 'on' : ''}`} to={item.to} onClick={() => setOpen(false)}>
                  {item.icon}
                  <span className="launcher-label">{item.label}</span>
                  <span className="launcher-sub">{item.sub}</span>
                </Link>
              ) : (
                <button key={item.to} type="button" className="launcher-tile soon" disabled aria-disabled="true">
                  {item.icon}
                  <span className="launcher-label">{item.label}</span>
                  <span className="launcher-sub">soon</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
