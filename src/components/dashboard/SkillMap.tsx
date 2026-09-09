import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessons } from '../../data/lessons';
import { worlds } from '../../data/curriculum';
import { getRevisionDue } from '../../services/progressService';
import type { ConceptNode, SkillGraph } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

const STATE_CLASS: Record<ConceptNode['state'], string> = {
  mastered: 'sk-mastered', strong: 'sk-strong', developing: 'sk-developing',
  weak: 'sk-weak', locked: 'sk-locked', current: 'sk-current', unknown: '',
};

export function SkillMap({ graph }: { graph: SkillGraph }) {
  const { stats } = usePlayer();
  const [focusId, setFocusId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [edges, setEdges] = useState<{ x1: number; y1: number; x2: number; y2: number; from: string; to: number | string }[]>([]);

  const currentWorldId = graph.nodes.find(n => n.state === 'current')?.worldId ?? worlds[0]?.id ?? null;
  const visible = useMemo(() => {
    if (showAll) return graph.nodes;
    const core = graph.nodes.filter(n => n.worldId === currentWorldId);
    const ids = new Set(core.map(n => n.id));
    for (const n of core) { n.prerequisiteIds.forEach(id => ids.add(id)); n.dependentIds.forEach(id => ids.add(id)); }
    return graph.nodes.filter(n => ids.has(n.id));
  }, [graph, showAll, currentWorldId]);

  const visibleIds = useMemo(() => new Set(visible.map(n => n.id)), [visible]);
  const columns = worlds.map(w => ({ w, nodes: visible.filter(n => n.worldId === w.id) })).filter(c => c.nodes.length > 0);
  const focus = focusId ? graph.nodes.find(n => n.id === focusId) ?? null : null;
  const neighbor = useMemo(() => (focus ? new Set([focus.id, ...focus.prerequisiteIds, ...focus.dependentIds]) : null), [focus]);

  const measure = useMemo(() => () => {
    const content = contentRef.current;
    if (!content) return;
    const out: { x1: number; y1: number; x2: number; y2: number; from: string; to: string }[] = [];
    for (const e of graph.edges) {
      if (!visibleIds.has(e.from) || !visibleIds.has(e.to)) continue;
      const a = nodeRefs.current.get(e.from); const b = nodeRefs.current.get(e.to);
      if (!a || !b) continue;
      out.push({ x1: a.offsetLeft + a.offsetWidth, y1: a.offsetTop + a.offsetHeight / 2, x2: b.offsetLeft, y2: b.offsetTop + b.offsetHeight / 2, from: e.from, to: e.to });
    }
    setEdges(out);
  }, [graph.edges, visibleIds]);

  useLayoutEffect(() => {
    measure();
    const content = contentRef.current;
    if (!content) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(content);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    const el = nodeRefs.current.get(currentWorldId ? (graph.nodes.find(n => n.state === 'current')?.id ?? '') : '');
    if (el && contentRef.current) contentRef.current.scrollLeft = Math.max(0, el.offsetLeft - 200);
  }, [graph, currentWorldId]);

  const sizeClass = (n: ConceptNode) => (n.dependentIds.length >= 3 ? 'sz2' : n.dependentIds.length >= 1 ? 'sz1' : '');
  const revision = getRevisionDue(stats);

  return (
    <section className="p-map">
      <div className="p-head">
        <span className="d-eyebrow">Skill Relationship Map</span>
        <button className="cta-outline" style={{ minHeight: 28, fontSize: 12 }} onClick={() => setShowAll(v => !v)}>
          {showAll ? 'show current world' : 'show all worlds'}
        </button>
      </div>
      <div className={`sk-wrap ${focus ? 'has-detail' : ''}`}>
        <div className="sk-scroll">
          <div className="sk-content" ref={contentRef}>
            <svg className="sk-edges" aria-hidden="true">
              <defs>
                <marker id="sk-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="var(--border-strong)" />
                </marker>
              </defs>
              {edges.map((e, i) => (
                <line key={i} x1={e.x1} y1={e.y1} x2={e.x2 - 4} y2={e.y2} markerEnd="url(#sk-arrow)"
                  className={focus && !(e.from === focus.id || e.to === focus.id) ? 'fade' : ''} />
              ))}
            </svg>
            {columns.map(col => (
              <div key={col.w.id} className="sk-col">
                <span className="d-micro" style={{ color: 'var(--text-subtle)' }}>W{col.w.number}</span>
                {col.nodes.map(n => (
                  <button key={n.id} type="button"
                    ref={el => { if (el) nodeRefs.current.set(n.id, el); else nodeRefs.current.delete(n.id); }}
                    className={`sk-node ${sizeClass(n)} ${STATE_CLASS[n.state]} ${focusId === n.id ? 'sel' : ''} ${neighbor && !neighbor.has(n.id) ? 'fade' : ''}`}
                    onClick={() => setFocusId(focusId === n.id ? null : n.id)}
                    aria-label={`${n.name}, ${n.state}${n.hasData ? `, mastery ${n.mastery}%` : ''}`}>
                    {n.name}
                    <small className={sizeClass(n) === '' ? 'hide' : undefined}>{n.hasData ? `${n.mastery}%` : n.state}</small>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        {focus && (
          <div className="sk-detail">
            <div className="d-title">{focus.name}</div>
            <div className="d-micro">mastery {focus.hasData ? `${focus.mastery}%` : '—'} · completion {focus.hasData ? `${focus.completion}%` : '—'} · {focus.state}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="cta-outline" style={{ minHeight: 32 }} to="/practice">Practice this</Link>
              {revision.some(r => r.kind === 'lesson' && focus.lessonIds.includes(r.id)) && (
                <Link className="cta-outline" style={{ minHeight: 32 }} to={`/learn/lesson/${focus.lessonIds[0]}`}>Review this</Link>
              )}
            </div>
            {focus.prerequisiteIds.length > 0 && (
              <div>
                <div className="d-micro" style={{ marginBottom: 6 }}>PREREQUISITES</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {focus.prerequisiteIds.map(id => (
                    <button key={id} type="button" className="chip2" onClick={() => setFocusId(id)}>{id}</button>
                  ))}
                </div>
              </div>
            )}
            {focus.dependentIds.length > 0 && (
              <div>
                <div className="d-micro" style={{ marginBottom: 6 }}>UNLOCKS</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {focus.dependentIds.map(id => (
                    <button key={id} type="button" className="chip2" onClick={() => setFocusId(id)}>{id}</button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="d-micro" style={{ marginBottom: 6 }}>RELATED LESSONS</div>
              {focus.lessonIds.map(id => (
                <Link key={id} className="d-micro" style={{ display: 'block', color: 'var(--signal-strong)' }} to={`/learn/lesson/${id}`}>
                  {lessons[id]?.title ?? id}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }} className="d-micro">
        {(['mastered', 'strong', 'developing', 'weak', 'locked'] as const).map(s => (
          <span key={s} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span className={`sk-node ${STATE_CLASS[s]}`} style={{ padding: 2, width: 10, height: 10, borderRadius: 2, display: 'inline-block' }} /> {s}
          </span>
        ))}
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, boxShadow: '0 0 0 2px var(--signal-focus)', display: 'inline-block' }} /> current focus
        </span>
      </div>
    </section>
  );
}
