import { useSyncExternalStore } from 'react';
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom';
import { can, getSession, signOut } from '../../services/authService';
import { getContentVersion, subscribeContent } from '../../services/contentStore';
import { Icon } from '../../components/common/Icon';

export default function AdminLayout() {
  const session = getSession();
  useSyncExternalStore(subscribeContent, getContentVersion);
  if (!session) return <Navigate to="/admin" replace />;

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', perm: null },
    { to: '/admin/content', label: 'Curriculum & Lessons', perm: 'structure.write' },
    { to: '/admin/collections', label: 'Problems · Projects · Achievements', perm: 'content.write' },
    { to: '/admin/settings', label: 'Tracker Settings', perm: 'settings.write' },
    { to: '/admin/theme', label: 'Theme Editor', perm: 'theme.write' },
  ].filter(l => !l.perm || can(l.perm));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', minHeight: '100vh' }} className="admin-shell">
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-subtle)', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="label-mono">CONTROL PLANE</span>
          <span className="chip chip-primary">{session.role}</span>
        </div>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`} style={{ height: 40 }}>
            <Icon name="learn" size={16} /> <span className="t-body">{l.label}</span>
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link className="btn btn-secondary btn-sm" to="/">View site</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => { void signOut(); window.location.href = '/admin'; }}>Sign out</button>
        </div>
      </aside>
      <main style={{ padding: 24, minWidth: 0 }}><div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}><Outlet /></div></main>
      <style>{`@media (max-width: 900px){ .admin-shell{grid-template-columns:1fr !important;} .admin-shell aside{flex-direction:row;flex-wrap:wrap;border-right:none;border-bottom:1px solid var(--border-subtle);} .admin-shell aside > div[style*="margin-top"]{margin:0 !important;flex-direction:row !important;} }`}</style>
    </div>
  );
}
