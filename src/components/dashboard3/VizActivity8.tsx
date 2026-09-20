import { Link } from 'react-router-dom';
import { getVisualizationRows, relTime } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

export function VizActivity8() {
  const { stats } = usePlayer();
  const rows = getVisualizationRows(stats).slice(0, 6);

  return (
    <section className="d8-panel" aria-label="Visualization activity">
      <div className="d3-chart-head">
        <span className="d3-eyebrow">Visualization Activity</span>
        <Link className="d-micro" style={{ color: 'var(--action-text)' }} to="/explore">Open Visualization Lab →</Link>
      </div>
      {rows.length === 0 ? (
        <div className="dempty">
          No visualization activity yet. <Link style={{ color: 'var(--action-text)' }} to="/explore">Explore the Visualization Lab</Link> to get started.
        </div>
      ) : (
        <div className="d8-viz">
          {rows.map(r => (
            <Link key={r.viz.id} className="d8-viz-item" to={`/explore/viz/${r.viz.id}`}>
              <span className="d8-viz-title">{r.viz.title}</span>
              <span className="chip2">{r.viz.category}</span>
              <span className="d8-viz-meta">
                {r.lastIso ? `last opened ${relTime(r.lastIso)}` : 'not opened yet'}{r.completed ? ' · completed' : ''}
              </span>
              <span className="d8-viz-action">{r.completed ? 'Reopen' : r.lastIso ? 'Resume' : 'Open'} →</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
