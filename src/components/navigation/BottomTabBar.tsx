import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../common/Icon';

const ExploreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M15 9l-2 5-4 1 2-5z" />
  </svg>
);
const YouIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.5-4 4-5.5 7-5.5S17.5 16 19 20" />
  </svg>
);

export function BottomTabBar() {
  const { pathname } = useLocation();
  const [sheet, setSheet] = useState<null | 'explore' | 'you'>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const exploreActive = pathname.startsWith('/explore') || pathname.startsWith('/graph') || pathname.startsWith('/projects');
  const youActive = pathname.startsWith('/progress') || pathname.startsWith('/profile') || pathname.startsWith('/settings');

  useEffect(() => {
    if (!sheet) return;
    sheetRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSheet(null); triggerRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const close = () => { setSheet(null); triggerRef.current?.focus(); };

  return (
    <>
      <nav className="tabbar" aria-label="Primary">
        <Link to="/" className={pathname === '/' ? 'on' : ''}><Icon name="home" size={20} /><span>Home</span></Link>
        <Link to="/learn" className={pathname.startsWith('/learn') ? 'on' : ''}><Icon name="learn" size={20} /><span>Learn</span></Link>
        <Link to="/practice" className={pathname.startsWith('/practice') ? 'on' : ''}><Icon name="practice" size={20} /><span>Practice</span></Link>
        <button ref={triggerRef} type="button" className={exploreActive ? 'on' : ''} aria-expanded={sheet === 'explore'} onClick={() => setSheet(sheet === 'explore' ? null : 'explore')}>
          <ExploreIcon /><span>Explore</span>
        </button>
        <button type="button" className={youActive ? 'on' : ''} aria-expanded={sheet === 'you'} onClick={() => setSheet(sheet === 'you' ? null : 'you')}>
          <YouIcon /><span>You</span>
        </button>
      </nav>

      {sheet && <button type="button" className="sheet-scrim" aria-label="Close menu" onClick={close} />}
      {sheet && (
        <div ref={sheetRef} className="sheet" role="dialog" aria-label={sheet === 'explore' ? 'Explore' : 'You'}>
          <div className="sheet-handle" aria-hidden="true" />
          {sheet === 'explore' ? (
            <div className="sheet-list">
              <Link to="/explore" onClick={close}>Visualizations</Link>
              <Link to="/graph" onClick={close}>Knowledge graph</Link>
              <Link to="/projects" onClick={close}>Projects</Link>
            </div>
          ) : (
            <div className="sheet-list">
              <Link to="/progress" onClick={close}>Progress</Link>
              <Link to="/profile" onClick={close}>Profile</Link>
              <Link to="/settings" onClick={close}>Settings</Link>
              <span className="sheet-soon">Coming soon: Books, Community, AI Assistant</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
