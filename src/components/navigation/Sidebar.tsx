import { Link, NavLink } from 'react-router-dom';
import { getOverallCompletion } from '../../services/progressService';
import { usePlayer } from '../../store/PlayerContext';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';

const PRIMARY: { to: string; label: string; icon: string | null; end?: boolean; dock: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true, dock: true },
  { to: '/learn', label: 'Curriculum', icon: 'learn', dock: true },
  { to: '/practice', label: 'Practice', icon: 'practice', dock: true },
  { to: '/projects', label: 'Projects', icon: null, dock: false },
  { to: '/explore', label: 'Visualizations', icon: 'explore', dock: true },
  { to: '/graph', label: 'Knowledge Graph', icon: null, dock: false },
  { to: '/books', label: 'Books', icon: null, dock: false },
  { to: '/progress', label: 'Progress', icon: 'progress', dock: true },
  { to: '/community', label: 'Community', icon: null, dock: false },
  { to: '/profile', label: 'Profile', icon: 'profile', dock: true },
];

export function Sidebar() {
  const { stats } = usePlayer();
  const overall = getOverallCompletion(stats);
  const openSearch = () => (document.querySelector('.tb-search button') as HTMLButtonElement | null)?.click();

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sb-head"><PixelWordmark size={15} /></div>
      <nav className="sb-nav">
        {PRIMARY.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} ${l.dock ? '' : 'sb-extra'}`}>
            {l.icon ? <Icon name={l.icon} size={19} /> : <span className="sb-dotmark" aria-hidden="true" />}
            <span className="sb-label">{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sb-rail-extra">
        <div className="sb-tools">
          <div className="label-mono" style={{ padding: '0 10px' }}>Tools</div>
          <button type="button" className="sb-tool" onClick={openSearch}>Search <span className="ui-mono">⌘K</span></button>
          <button type="button" className="sb-tool" disabled aria-disabled="true">AI Assistant <span className="chip2">soon</span></button>
        </div>

        <div className="sb-pod">
          <span className="ui-index">Keep going</span>
          <span className="t-body-sm" style={{ color: 'var(--text-primary)' }}>{overall}% of curriculum complete</span>
          <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Curriculum completion">
            <div style={{ width: `${overall}%` }} />
          </div>
        </div>

        <div className="sb-tools">
          <Link className="sb-tool" to="/settings">Settings</Link>
          <Link className="sb-tool" to="/settings">Help & Support</Link>
        </div>
      </div>

      <div className="sb-foot">
        <div className="sb-env" aria-label="Connection status" title="Connection status">
          <span className="dot" style={{ background: 'var(--signal-mastered)' }} aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}
