import { Link } from 'react-router-dom';
import { useDashboardData } from '../../dashboard/useDashboard';
import { usePlayer } from '../../store/PlayerContext';

export function ProjectPanel3() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  const zone = d.projects;

  if (zone.status !== 'ready' || !zone.data) {
    return (
      <section className="d3-projects" aria-label="Projects">
        <div className="d3-eyebrow" style={{ marginBottom: 12 }}>Projects</div>
        <div className="dempty">No projects published yet. They appear here once authored.</div>
      </section>
    );
  }

  const { rows } = zone.data;
  const lastDoneEvent = [...(stats.events ?? [])].filter(e => e.kind === 'project_completed').pop();
  const active = rows.find(r => r.project.id === lastDoneEvent?.id && !r.done) ?? rows.find(r => !r.done) ?? rows[0];
  const others = rows.filter(r => r.project.id !== active.project.id);
  const p = active.project as any;
  const summary: string = p.summary ?? p.description ?? '';
  const milestones: string[] = p.requirements ?? [];
  const doneCount = active.done ? milestones.length : 0;

  return (
    <section className="d3-projects" aria-label="Project analytics">
      <div className="d3-projects-head">
        <span className="d3-eyebrow">Projects</span>
        {others.length > 0 && <span className="d3-projects-more">{others.length} more</span>}
      </div>

      <article className="d3-project">
        <div className="d3-project-top">
          <span className="d3-project-title">{active.project.title}</span>
          <span className="chip">{p.difficulty ?? 'project'}</span>
        </div>
        {summary && <p className="d3-project-sum">{summary}</p>}

        <div className="d3-stepper" role="list" aria-label="Project milestones">
          {milestones.map((m, i) => (
            <div key={m} role="listitem" className={`d3-step ${i < doneCount ? 'done' : i === doneCount ? 'current' : 'next'}`}>
              <span className="d3-step-dot" aria-hidden="true" />
              <span className="d3-step-label">{m}</span>
            </div>
          ))}
        </div>

        <div className="d3-project-meta">
          <span>Next: {milestones[doneCount] ?? 'Complete'}</span>
          <span>{active.done ? 'Completed' : 'In progress'}</span>
        </div>

        {active.skills && active.skills.length > 0 && (
          <div className="d3-project-skills">{active.skills.map(s => <span key={s} className="chip2">{s}</span>)}</div>
        )}

        <div>
          <Link className="cta-outline" to={p.levelId ? `/learn/level/${p.levelId}` : '/learn'}>
            {active.done ? 'Review project' : 'Open project'}
          </Link>
        </div>

        {others.length > 0 && (
          <div className="d3-project-others">
            {others.map(o => (
              <Link key={o.project.id} className="chip" to={(o.project as any).levelId ? `/learn/level/${(o.project as any).levelId}` : '/learn'}>
                {o.project.title}
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
