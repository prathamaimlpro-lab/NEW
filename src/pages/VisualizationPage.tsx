import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, SectionIndex, StatementHeader } from '../components/ui/primitives';
import { listVisualizations } from '../components/visualization/registry';
import { getConcept, listAll } from '../services/contentService';
import '../components/dashboard3/pagev4.css';

export default function VisualizationPage() {
  const { vizId = '' } = useParams();
  const all = useMemo(() => listVisualizations(), []);
  const current = all.find(v => v.id === vizId) ?? all[0];
  const categories = useMemo(() => [...new Set(all.map(v => v.category))], [all]);
  const [cat, setCat] = useState<string>(current?.category ?? categories[0] ?? '');
  const list = all.filter(v => v.category === cat);
  const Comp = (current as any)?.component ?? (current as any)?.Component;
  const related = useMemo(() => listAll('visuals').filter(v => v.visualizationId === current?.id), [current]);
  const concepts = related.map(r => getConcept(r.conceptId)).filter(Boolean);

  if (!current) {
    return (
      <div className="ui-panel">
        <StatementHeader lead="Visualization Lab —" emphasis="no visualizations published yet." />
        <EmptyState action={<Link className="btn btn-secondary btn-sm" to="/explore">Back to Explore</Link>}>
          Interactive visualizations appear here once authored.
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <StatementHeader lead="Visualization Lab —" emphasis={`${current.title}.`} />

      <div className="v4-viz">
        <aside className="v4-rail" aria-label="Visualization navigation">
          <div className="ui-index" style={{ marginBottom: 4 }}>Categories</div>
          {categories.map(c => (
            <button key={c} type="button" className={`v4-rail-item ${c === cat ? 'on' : ''}`} onClick={() => setCat(c)} aria-pressed={c === cat}>
              {c}
            </button>
          ))}
          <div className="ui-index" style={{ margin: '10px 0 4px' }}>Visualizations</div>
          {list.map(v => (
            <Link key={v.id} className={`v4-rail-item ${v.id === current.id ? 'on' : ''}`} to={`/explore/viz/${v.id}`}>
              {v.title}
            </Link>
          ))}
        </aside>

        <div className="v4-canvas" aria-label={`${current.title} canvas`}>
          {typeof Comp === 'function'
            ? <Comp />
            : <EmptyState>This visualization has no runnable component yet.</EmptyState>}
        </div>

        <aside className="v4-inspector" aria-label="Inspector">
          <div className="ui-pod">
            <span className="ui-index">About</span>
            <span className="ui-pod-title">{current.title}</span>
            <span className="ui-mono ui-muted">{current.category}</span>
            {(current as any).description && <p className="t-body-sm">{(current as any).description}</p>}
          </div>
          <div className="ui-pod">
            <span className="ui-index">Related concepts</span>
            {concepts.length === 0
              ? <span className="ui-mono ui-muted">No linked concepts yet.</span>
              : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {concepts.map(c => c && <Link key={c.id} className="chip2" to="/graph">{c.title}</Link>)}
                </div>
              )}
            {related[0]?.caption && <span className="ui-mono ui-muted">{related[0].caption}</span>}
          </div>
        </aside>
      </div>

      <div className="v4-controlbar">
        <span className="ui-mono ui-muted">Playback controls (play / step / reset) are embedded in the canvas above.</span>
        <Link className="btn btn-ghost btn-sm" to="/explore">All visualizations</Link>
      </div>
    </>
  );
}
