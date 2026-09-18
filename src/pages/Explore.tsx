import { Link } from 'react-router-dom';
import { listVisualizations } from '../components/visualization/registry';
import { lessons, levels, worlds } from '../data/curriculum';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import { usePlayer } from '../store/PlayerContext';

const COMING_SOON: [string, string][] = [
  ['Coding Playground', 'Write-and-run programming tasks with real execution.'],
  ['Linux Simulator', 'A safe shell filesystem to practice commands.'],
  ['Git Simulator', 'Working tree, staging and commits, visualized.'],
  ['SQL Simulator', 'Query real tables and inspect results.'],
  ['Networking Simulator', 'Packets, routes and TLS handshakes.'],
  ['AI Teacher', 'Guided explanations grounded in your curriculum.'],
];

export default function Explore() {
  const { stats } = usePlayer();
  const viz = listVisualizations();
  const pubProjects = projects.filter(p => p.status === 'PUBLISHED');
  const pubLessons = Object.values(lessons).filter(l => l.status === 'PUBLISHED');
  const pubQuestions = pubLessons.flatMap(l => l.practice).length;
  const pubProblems = problems.filter(p => p.status === 'PUBLISHED').length;

  return (
    <>
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>Explore</div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>Discover real Pixel content</h1>
        <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
          Everything below is wired to content that exists today. Planned tools are labeled coming soon — nothing here pretends to work.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <Link className="card card-interactive" to="/learn">
          <div className="d-title" style={{ fontSize: 16 }}>Curriculum</div>
          <div className="d-micro" style={{ marginTop: 6 }}>{worlds.length} worlds · {levels.length} levels · {pubLessons.length} published lessons</div>
          <span className="chip chip-success" style={{ marginTop: 10 }}>Available</span>
        </Link>
        <Link className="card card-interactive" to="/practice">
          <div className="d-title" style={{ fontSize: 16 }}>Practice</div>
          <div className="d-micro" style={{ marginTop: 6 }}>{pubQuestions} knowledge questions · {pubProblems} tracked problems</div>
          <span className="chip chip-success" style={{ marginTop: 10 }}>Available</span>
        </Link>
        <Link className="card card-interactive" to="/progress">
          <div className="d-title" style={{ fontSize: 16 }}>Progress & Analytics</div>
          <div className="d-micro" style={{ marginTop: 6 }}>Activity, mastery, practice patterns and revision</div>
          <span className="chip chip-success" style={{ marginTop: 10 }}>Available</span>
        </Link>
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Visualizations</span><span className="d-micro">{viz.length} available</span></div>
        {viz.length === 0 ? <div className="dempty">No visualizations published yet.</div> : viz.map(v => (
          <Link key={v.id} className="lrow" to={`/explore/viz/${v.id}`}>
            <span className="rail"><span className="dot" style={{ background: stats.completedVisualizations.includes(v.id) ? 'var(--signal-mastered, #10B981)' : 'var(--signal-strong, #38BDFB)' }} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>{v.title}</span>
              <span className="d-micro" style={{ color: 'var(--text-muted, #64748B)' }}>{v.category} · {v.topic}</span>
            </span>
            <span className="chip">{stats.completedVisualizations.includes(v.id) ? 'Completed' : 'Available'}</span>
          </Link>
        ))}
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Projects</span></div>
        {pubProjects.length === 0 ? <div className="dempty">No projects published yet. Projects appear here as they are authored.</div> : pubProjects.map(p => (
          <Link key={p.id} className="lrow" to={p.levelId ? `/learn/level/${p.levelId}` : '/learn'}>
            <span className="rail"><span className="dot" style={{ background: stats.completedProjects.includes(p.id) ? 'var(--signal-mastered, #10B981)' : 'var(--text-secondary, #94A3B8)' }} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>{p.title}</span>
              <span className="d-micro" style={{ color: 'var(--text-muted, #64748B)' }}>{p.difficulty} · +{p.xp} XP</span>
            </span>
            <span className="chip">{stats.completedProjects.includes(p.id) ? 'Completed' : 'Available'}</span>
          </Link>
        ))}
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Coming soon</span></div>
        {COMING_SOON.map(([name, desc]) => (
          <div key={name} className="lrow" style={{ opacity: 0.75 }}>
            <span className="rail"><span className="dot" style={{ background: 'var(--text-subtle, #475569)' }} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="d-body" style={{ color: 'var(--text-secondary, #94A3B8)', display: 'block' }}>{name}</span>
              <span className="d-micro" style={{ color: 'var(--text-muted, #64748B)' }}>{desc}</span>
            </span>
            <span className="chip chip-warning">Coming soon</span>
          </div>
        ))}
        <p className="d-micro" style={{ marginTop: 10, color: 'var(--text-muted, #64748B)' }}>
          States: Available = accessible now · Locked = prerequisites pending (shown in Curriculum) · Coming soon = planned, not functional · Empty = category exists, no content yet.
        </p>
      </section>
    </>
  );
}
