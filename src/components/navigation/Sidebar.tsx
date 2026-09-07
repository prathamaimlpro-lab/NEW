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

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sb-head"><Emblem size={34} /><span className="sb-brand">IT QUEST</span></div>
      <QuickFind />
      <nav className="sb-nav">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name={l.icon} size={19} /> <span className="sb-label">{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sb-foot">
        <div className="sb-env">
          <span className="t-caption">Environment</span>
          <span className="chip chip-success">● Online</span>
        </div>
      </div>
    </aside>
  );
}
