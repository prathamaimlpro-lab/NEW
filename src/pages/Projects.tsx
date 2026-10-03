import { Link } from 'react-router-dom';
import { getProjects } from '../services/contentService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/progress7.css';

export default function ProjectsPage() {
  const { stats } = usePlayer();
  const projects = getProjects();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header className="ui-statement">
        <h1 className="ui-h1">Projects</h1>
        <p className="ui-desc">Builds that apply the skills you are learning.</p>
      </header>

      {projects.length === 0 ? (
        <div className="dempty">No projects published yet.</div>
      ) : (
        <div className="pj-grid">
          {projects.map(p => {
            const done = stats.completedProjects.includes(p.id);
            const meta = `${(p.requirements ?? []).length} milestones${(p as any).difficulty ? ` · ${(p as any).difficulty}` : ''}`;
            return (
              <Link key={p.id} className="pj-card" to="/learn">
                <span className="pj-title">{p.title}</span>
                <span className="pj-meta">{meta}</span>
                <span className={`chip ${done ? 'chip-success' : ''}`}>{done ? 'Completed' : 'Available'}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
