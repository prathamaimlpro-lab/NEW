import { Link } from 'react-router-dom';
import { EmptyState, SectionIndex, StatPod, StatementHeader } from '../components/ui/primitives';
import { getProjects } from '../services/contentService';
import { usePlayer } from '../store/PlayerContext';

export default function ProjectsPage() {
  const { stats } = usePlayer();
  const projects = getProjects();
  const done = projects.filter(p => stats.completedProjects.includes(p.id)).length;

  return (
    <>
      <SectionIndex index="01" label="Projects" />
      <StatementHeader lead="What you are building —" emphasis={`${done} of ${projects.length} complete.`} />
      {projects.length === 0 ? (
        <EmptyState>No projects published yet. They appear here once authored in the Content Studio.</EmptyState>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {projects.map(p => {
            const isDone = stats.completedProjects.includes(p.id);
            const ev = [...(stats.events ?? [])].filter(e => e.kind === 'project_completed' && e.id === p.id).pop();
            return (
              <StatPod
                key={p.id}
                tone={isDone ? 'ok' : 'info'}
                statusLabel={isDone ? 'completed' : 'available'}
                id={p.id}
                title={p.title}
                timestamp={ev ? new Date(ev.at).toLocaleString() : undefined}
                action={<Link className="btn btn-secondary btn-sm" to="/learn">Open curriculum</Link>}
              >
                <p className="t-body-sm">{p.summary}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(p.requirements ?? []).slice(0, 3).map(r => <span key={r} className="chip2">{r}</span>)}
                </div>
              </StatPod>
            );
          })}
        </div>
      )}
    </>
  );
}
