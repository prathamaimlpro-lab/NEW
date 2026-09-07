import { Link } from 'react-router-dom';
import { achievementsData } from '../../data/achievements';
import { levels, worlds } from '../../data/curriculum';
import { lessons } from '../../data/lessons';
import { problems } from '../../data/problems';
import { listVisualizations } from '../../components/visualization/registry';
import { sbEnabled } from '../../services/supabaseRest';

export default function AdminDashboard() {
  const cards: [string, string | number][] = [
    ['Worlds', worlds.length], ['Levels', levels.length], ['Lessons', Object.keys(lessons).length],
    ['Visualizers', listVisualizations().length], ['Problems', problems.length], ['Achievements', achievementsData.length],
    ['Users', sbEnabled() ? 'backend' : 1], ['Mode', sbEnabled() ? 'Supabase' : 'Local'],
  ];
  return (
    <>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>OPERATIONS</div><h1 className="t-hlg">Dashboard</h1>
        <p className="t-body" style={{ marginTop: 6, color: 'var(--fg-muted)' }}>All counts are read live from the content repository. In local mode “Users” reflects this device; connect Supabase for real multi-user telemetry.</p></div>
      <div className="grid-4">
        {cards.map(([k, v]) => <div key={String(k)} className="card"><div className="label-mono" style={{ marginBottom: 8 }}>{String(k).toUpperCase()}</div><div className="t-hmd">{v}</div></div>)}
      </div>
      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" to="/admin/content">Manage curriculum</Link>
        <Link className="btn btn-secondary" to="/admin/collections">Manage problems & achievements</Link>
        <Link className="btn btn-secondary" to="/admin/theme">Theme editor</Link>
      </div>
    </>
  );
}
