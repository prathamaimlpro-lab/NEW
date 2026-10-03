import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getOverallCompletion, getRevisionDue } from '../../services/progressService';
import { usePlayer } from '../../store/PlayerContext';
import { PixelWordmark } from '../brand/PixelLogo';
import { Icon } from '../common/Icon';

const COLLAPSE_KEY = 'pixel_sidebar_collapsed';
const ProjectsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 7h6l2 2h10v10H3z" /><path d="M3 7V5h8l2 2" /></svg>);
const GraphIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="10" cy="18" r="2.5" /><path d="M8 7l7 1M7 8l2 8M16 10l-4 6" /></svg>);
const CodeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></svg>);
const GearIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></svg>);
const HelpIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-.9.8-.9 1.7" /><circle cx="12" cy="17" r=".5" /></svg>);
const CollapseIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>);

export function Sidebar() {
  const { stats } = usePlayer();
  const overall = getOverallCompletion(stats);
  const due = getRevisionDue(stats).length;
  const [collapsed, setCollapsed] = useState<boolean>(() => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } });
  const [drawer, setDrawer] = useState(false);

  useEffect(() => { try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* ignore */ } }, [collapsed]);

  const openSearch = () => (document.querySelector('.tb-search button') as HTMLButtonElement | null)?.click();

  return (
    <>
      {drawer && <button type="button" className="sheet-scrim sb-scrim" aria-label="Close navigation" onClick={() => setDrawer(false)} />}
      <aside className={`sidebar ${collapsed ? 'rail' : ''} ${drawer ? 'drawer' : ''}`} aria-label="Primary navigation">
        <div className="sb-head">
          <PixelWordmark size={15} />
          <button type="button" className="sb-collapse" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={collapsed}><CollapseIcon /></button>
          <button type="button" className="sb-expand" onClick={() => setDrawer(true)} aria-label="Expand navigation"><CollapseIcon /></button>
        </div>

        <nav className="sb-nav">
          <NavLink to="/" end title="Home" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="home" size={18} /> <span className="sb-label">Home</span>
          </NavLink>

          <div className="sb-group">Learn</div>
          <NavLink to="/learn" title="Curriculum" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="learn" size={18} /> <span className="sb-label">Curriculum</span>
          </NavLink>
          <NavLink to="/practice" title={due ? `Practice, ${due} revision due` : 'Practice'} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="practice" size={18} /> <span className="sb-label">Practice</span>
            {due > 0 && <span className="sb-badge" aria-hidden="true">{due}</span>}
          </NavLink>
          <NavLink to="/coding" title="Coding" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} sb-nodock`}>
            <CodeIcon /> <span className="sb-label">Coding</span>
          </NavLink>
          <NavLink to="/projects" title="Projects" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} sb-nodock`}>
            <ProjectsIcon /> <span className="sb-label">Projects</span>
          </NavLink>

          <div className="sb-group">Explore</div>
          <NavLink to="/explore" title="Visualizations" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="explore" size={18} /> <span className="sb-label">Visualizations</span>
          </NavLink>
          <NavLink to="/graph" title="Knowledge graph" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''} sb-nodock`}>
            <GraphIcon /> <span className="sb-label">Knowledge graph</span>
          </NavLink>

          <div className="sb-group">You</div>
          <NavLink to="/progress" title="Progress" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="progress" size={18} /> <span className="sb-label">Progress</span>
          </NavLink>
          <NavLink to="/profile" title="Profile" className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
            <Icon name="profile" size={18} /> <span className="sb-label">Profile</span>
          </NavLink>
        </nav>

        <div className="sb-bottom">
          <button type="button" className="sb-tool" onClick={openSearch}>Search <span className="ui-mono">⌘K</span></button>
          <div className="sb-prog">
            <div className="ui-index sb-prog-text">Curriculum {overall}%</div>
            <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Curriculum completion">
              <div style={{ width: `${overall}%` }} />
            </div>
          </div>
          <Link to="/settings" className="sb-tool"><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><GearIcon /> <span className="sb-label">Settings</span></span></Link>
          <Link to="/settings" className="sb-tool"><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><HelpIcon /> <span className="sb-label">Help</span></span></Link>
        </div>
      </aside>
    </>
  );
}
