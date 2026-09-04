import { NavLink } from 'react-router-dom';
import { Emblem } from '../common/Emblem';
import { Icon } from '../common/Icon';
import { QuickFind } from './QuickFind';

const LINKS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/learn', label: 'Learn', icon: 'learn', end: false },
  { to: '/practice', label: 'Practice', icon: 'practice', end: false },
  { to: '/explore', label: 'Explore', icon: 'explore', end: false },
  { to: '/progress', label: 'Progress', icon: 'progress', end: false },
  { to: '/profile', label: 'Profile', icon: 'profile', end: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
      <div className="sb-head">
        <Emblem size={36} />
        <span className="sb-brand">IT QUEST</span>
        <span className="chip" style={{ marginLeft: 'auto' }}>V2 OS</span>
      </div>
      <QuickFind />
      <nav className="sb-nav">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name={l.icon} size={18} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sb-foot">
        <div className="sb-env">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="t-body-sm" style={{ color: 'var(--fg-secondary)' }}>Environment</span>
            <span className="chip chip-success">● Online</span>
          </div>
          <div className="mono t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>local build · ready</div>
        </div>
      </div>
    </aside>
  );
}
