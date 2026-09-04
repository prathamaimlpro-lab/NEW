import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <div className="shell-main">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="page">
          <div className="page-inner fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
