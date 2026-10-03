import { Link } from 'react-router-dom';
import { listVisualizations } from '../components/visualization/registry';
import { getVisualizationRows } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';

export default function Explore() {
  const { stats } = usePlayer();
  const rows = getVisualizationRows(stats);
  const byId = new Map(rows.map(r => [r.viz.id, r]));
  const all = listVisualizations();

  return (
    <>
      <header className="ui-statement">
        <h1 className="ui-h1">Visualizations</h1>
        <p className="ui-desc">Interactive models for algorithms, systems and data structures.</p>
      </header>

      {all.length === 0 ? (
        <div className="dempty">No visualizations published yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {all.map(v => {
            const r = byId.get(v.id);
            const state = r?.completed ? 'Completed' : r?.lastIso ? 'Started' : 'Available';
            return (
              <Link key={v.id} className="ui-pod" style={{ textDecoration: 'none' }} to={`/explore/viz/${v.id}`}>
                <span className="ui-pod-title">{v.title}</span>
                <span className="ui-mono ui-muted">{v.category}</span>
                <span className={`chip ${r?.completed ? 'chip-success' : r?.lastIso ? 'chip-info' : ''}`}>{state}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
