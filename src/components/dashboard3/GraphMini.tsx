import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buildConceptGraph } from '../../dashboard/graphSelectors';
import { layeredLayout } from '../../services/graphLayout';
import { usePlayer } from '../../store/PlayerContext';

const COLOR: Record<string, string> = {
  mastered: 'var(--success)', 'in-progress': 'var(--action)', available: 'var(--text-subtle)',
  locked: 'var(--border-strong)', current: 'var(--warning)',
};

export function GraphMini() {
  const { stats } = usePlayer();
  const graph = useMemo(() => buildConceptGraph(stats), [stats]);
  const layout = useMemo(() => layeredLayout(
    graph.nodes.map(n => ({
      id: n.id,
      prerequisiteIds: graph.edges.filter(e => e.to === n.id && e.kind === 'prerequisite').map(e => e.from),
      dependentIds: graph.edges.filter(e => e.from === n.id && e.kind === 'prerequisite').map(e => e.to),
      worldNumber: n.worldNumber, centrality: 1,
    })),
    graph.edges.filter(e => e.kind === 'prerequisite'),
  ), [graph]);

  if (graph.nodes.length === 0) {
    return (
      <section className="ui-panel" aria-label="Knowledge graph">
        <div className="ui-index" style={{ marginBottom: 8 }}>Knowledge Graph</div>
        <div className="dempty">No published concepts yet.</div>
      </section>
    );
  }

  return (
    <section className="ui-panel" aria-label="Knowledge graph preview">
      <div className="ui-panel-head">
        <div className="ui-index">Knowledge Graph</div>
        <Link className="ui-mono" style={{ color: 'var(--action-text)' }} to="/graph">Open graph →</Link>
      </div>
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="v3-graphmini" role="img"
        aria-label={`Concept map with ${graph.nodes.length} concepts and ${graph.edges.length} relationships`}>
        {layout.edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--border-strong)" strokeWidth={1.5} />
        ))}
        {layout.nodes.map(n => {
          const g = graph.nodes.find(x => x.id === n.id);
          if (!g) return null;
          return <circle key={n.id} cx={n.x + n.w / 2} cy={n.y + n.h / 2} r={10} fill={COLOR[g.status]} opacity={g.status === 'locked' ? 0.5 : 0.9} />;
        })}
      </svg>
      <div className="v3-graphlegend">
        {(['mastered', 'in-progress', 'available', 'locked', 'current'] as const).map(s => (
          <span key={s} className="ui-mono"><span className="v3-lg-dot" style={{ background: COLOR[s] }} aria-hidden="true" />{s}</span>
        ))}
      </div>
    </section>
  );
}
