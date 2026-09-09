import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { achievementsData } from '../../data/achievements';
import { levels, worlds } from '../../data/curriculum';
import { lessons } from '../../data/lessons';
import { problems } from '../../data/problems';
import { projects } from '../../data/projects';
import { listVisualizations } from '../../components/visualization/registry';
import { exportContent, importContent } from '../../services/contentStore';
import { sbEnabled } from '../../services/supabaseRest';

export default function AdminDashboard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const cards: [string, string | number][] = [
    ['Worlds', worlds.length], ['Levels', levels.length], ['Lessons', Object.keys(lessons).length],
    ['Visualizers', listVisualizations().length], ['Problems', problems.length], ['Projects', projects.length],
    ['Achievements', achievementsData.length], ['Mode', sbEnabled() ? 'Supabase' : 'Local'],
  ];

  const doExport = () => {
    const blob = new Blob([exportContent()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pixel-content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Content exported.');
  };

  return (
    <>
      <div><div className="label-mono" style={{ marginBottom: 8 }}>OPERATIONS</div><h1 className="t-hlg">Dashboard</h1>
        <p className="t-body" style={{ marginTop: 6, color: 'var(--fg-2)' }}>Counts are read live from the single content source that both Admin and the learner site use.</p></div>
      <div className="grid-4">
        {cards.map(([k, v]) => <div key={String(k)} className="card"><div className="label-mono" style={{ marginBottom: 8 }}>{String(k).toUpperCase()}</div><div className="t-hmd">{v}</div></div>)}
      </div>
      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link className="btn btn-primary" to="/admin/content">Manage curriculum</Link>
        <Link className="btn btn-secondary" to="/admin/collections">Problems · Projects · Achievements</Link>
        <Link className="btn btn-secondary" to="/admin/theme">Theme editor</Link>
        <button className="btn btn-secondary" onClick={doExport}>Export content</button>
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>Import content</button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={async e => {
          const f = e.target.files?.[0]; if (!f) return;
          const text = await f.text();
          const err = importContent(text);
          setMsg(err ? `Import failed (nothing changed): ${err}` : 'Import validated and applied.');
          e.target.value = '';
        }} />
        {msg && <span className="t-body-sm" style={{ color: 'var(--fg-1)' }}>{msg}</span>}
      </div>
    </>
  );
}
