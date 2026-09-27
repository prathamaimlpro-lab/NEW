import { Link } from 'react-router-dom';

const ACTIONS = [
  { to: '/practice', label: 'Start Practice', sub: 'Knowledge questions & assessments' },
  { to: '/explore', label: 'Open Visualizations', sub: 'Algorithms & systems, interactive' },
  { to: '/graph', label: 'View Knowledge Graph', sub: 'Concept dependencies & mastery' },
  { to: '/projects', label: 'Continue Projects', sub: 'Milestones, skills, builds' },
  { to: '/books', label: 'Browse Books', sub: 'Technical library (in development)' },
];

export function QuickActions() {
  return (
    <section className="ui-panel" aria-label="Quick actions">
      <div className="ui-index" style={{ marginBottom: 4 }}>Quick Actions</div>
      {ACTIONS.map(a => (
        <Link key={a.to} className="v3-qa" to={a.to}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="v3-insight-title">{a.label}</span>
            <span className="ui-mono ui-muted" style={{ display: 'block' }}>{a.sub}</span>
          </span>
          <span aria-hidden="true">›</span>
        </Link>
      ))}
    </section>
  );
}
