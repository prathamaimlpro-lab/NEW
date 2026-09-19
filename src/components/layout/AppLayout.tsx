import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { PageSkeleton } from '../common/PageSkeleton';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { usePlayer } from '../../store/PlayerContext';

export default function AppLayout() {
  const location = useLocation();
  const navType = useNavigationType();
  const { dataState, retrySync } = usePlayer();
  const isDash = location.pathname === '/';

  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <main className={`page ${isDash ? 'page-full' : ''}`}>
          {dataState === 'loading' ? (
            <PageSkeleton route={location.pathname} />
          ) : dataState === 'error' ? (
            <div className="state-error" role="alert" style={{ maxWidth: 560, margin: '48px auto', padding: 20 }}>
              <span>Unable to load your progress. Nothing was lost — try again, or continue with this device's saved data once loading succeeds.</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={retrySync}>Try again</button>
            </div>
          ) : (
            <div className={isDash ? 'page-inner-full' : 'page-inner fade-in'} key={location.pathname}>
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
