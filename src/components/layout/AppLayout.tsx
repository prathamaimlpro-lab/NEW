import { useEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { PageSkeleton } from '../common/PageSkeleton';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { usePlayer } from '../../store/PlayerContext';

export default function AppLayout() {
  const location = useLocation();
  const navType = useNavigationType();
  const { dataState, syncState, retrySync } = usePlayer();
  const isDash = location.pathname === '/';

  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <main id="main-content" className={`page ${isDash ? 'page-full' : ''}`}>
          {dataState === 'loading' ? (
            <PageSkeleton route={location.pathname} />
          ) : dataState === 'error' ? (
            <div className="state-error" role="alert" style={{ maxWidth: 560, margin: '48px auto', padding: 20 }}>
              <span>Unable to load your progress. Check your connection and try again.</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={retrySync}>Try again</button>
            </div>
          ) : (
            <>
              {syncState === 'error' && (
                <div className="state-error" role="status" style={{ margin: '0 16px 12px', padding: '10px 14px' }}>
                  <span>Couldn't sync with the server — showing your saved progress on this device.</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={retrySync}>Retry</button>
                </div>
              )}
              <div className={isDash ? 'page-inner-full' : 'page-inner fade-in'} key={location.pathname}>
                <Outlet />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
