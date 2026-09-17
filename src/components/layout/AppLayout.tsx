import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';

export default function AppLayout() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  const isDash = location.pathname === '/';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <main className={`page ${isDash ? 'page-full' : ''}`}>
          <div className={isDash ? 'page-inner-full' : 'page-inner fade-in'} key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
