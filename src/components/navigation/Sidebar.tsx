import { Link, NavLink } from 'react-router-dom';
import { getOverallCompletion } from '../../services/progressService';
import { usePlayer } from '../../store/PlayerContext';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';

const ProjectsIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3 7h6l2 2h10v10H3z" /><path d="M3 7V5h8l2 2" />
  </svg>
);
const GraphIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="10" cy="18" r="2.5" />
    <path d="M8 7l7 1M7 8l2 8M16 10l-4 6" />
  </svg>
);
const GearIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
  </svg>
);

export function Sidebar() {
  const { stats } = usePlayer();
  const overall = getOverallCompletion(stats);
  const openSearch = () => (document.querySelector('.tb-search button') as HTMLButtonElement | null)?.click();

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sb-head"><PixelWordmark size={15} /></div>
      <nav className="sb-nav" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <NavLink to="/" end className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="home" size={19} /> <span className="sb-label">Home</span>
        </NavLink>

        <div className="sb-group">Learn</div>
        <NavLink to="/learn" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="learn" size={19} /> <span className="sb-label">Curriculum</span>
        </NavLink>
        <NavLink to="/practice" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="practice" size={19} /> <span className="sb-label">Practice</span>
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} sb-nodock`}>
          <ProjectsIcon /> <span className="sb-label">Projects</span>
        </NavLink>

        <div className="sb-group">Explore</div>
        <NavLink to="/explore" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="explore" size={19} /> <span className="sb-label">Visualizations</span>
        </NavLink>
        <NavLink to="/graph" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} sb-nodock`}>
          <GraphIcon /> <span className="sb-label">Knowledge Graph</span>
        </NavLink>

        <div className="sb-group">You</div>
        <NavLink to="/progress" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="progress" size={19} /> <span className="sb-label">Progress</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
          <Icon name="profile" size={19} /> <span className="sb-label">Profile</span>
        </NavLink>
        <Link to="/settings" className="sb-link sb-nodock">
          <GearIcon /> <span className="sb-label">Settings</span>
        </Link>
      </nav>

      <div className="sb-bottom">
        <button type="button" className="sb-tool" onClick={openSearch}>Search <span className="ui-mono">⌘K</span></button>
        <div style={{ padding: '4px 10px' }}>
          <div className="ui-index" style={{ marginBottom: 6 }}>Curriculum {overall}%</div>
          <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Curriculum completion">
            <div style={{ width: `${overall}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
