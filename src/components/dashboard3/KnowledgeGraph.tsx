import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { layeredLayout } from '../../services/graphLayout';
import { buildConceptGraph, conceptInspector, type GraphNodeStatus } from '../../dashboard/graphSelectors';
import { usePlayer } from '../../store/PlayerContext';

const STATUS_CLASS: Record<GraphNodeStatus, string> = {
  mastered: 'kg-mastered', 'in-progress': 'kg-progress', available: 'kg-available', locked: 'kg-locked', current: 'kg-current',
};

export function KnowledgeGraph() {
  const { stats } = usePlayer();
  const [view, setView] = useState<'current' | 'all'>('current');
  const [statusFilter, setStatusFilter] = useState<'ALL' | GraphNodeStatus>('ALL');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [pan, setPan] = useState({ scale: 1, tx: 0, ty: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const interacted = useRef(false);

  const graph = useMemo(() => buildConceptGraph(stats), [stats]);
  const currentWorld = useMemo(() => graph.nodes.find(n => n.status === 'current')?.worldNumber ?? null, [graph]);

  const visibleNodes = useMemo(() => graph.nodes.filter(n => {
    if (view === 'current' && currentWorld !== null && n.worldNumber !== currentWorld) {
      const connected = graph.edges.some(e => (e.from === n.id || e.to === n.id));
      if (!connected) return false;
    }
    if (statusFilter !== 'ALL' && n.status !== statusFilter) return false;
    return true;
  }), [graph, view, currentWorld, statusFilter]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => graph.edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to)), [graph, visibleIds]);

  const layout = useMemo(() => layeredLayout(
    visibleNodes.map(n => ({
      id: n.id,
      prerequisiteIds: visibleEdges.filter(e => e.to === n.id && e.kind === 'prerequisite').map(e => e.from),
      dependentIds: visibleEdges.filter(e => e.from === n.id && e.kind === 'prerequisite').map(e => e.to),
      worldNumber: n.worldNumber,
      centrality: visibleEdges.filter(e => e.from === n.id).length,
    })),
    visibleEdges.filter(e => e.kind === 'prerequisite'),
  ), [visibleNodes, visibleEdges]);

  const fit = useMemo(() => () => {
    const el = containerRef.current;
    if (!el || layout.width === 0 || layout.height === 0) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const scale = Math.min(cw / layout.width, ch / layout.height, 1);
    const cw2 = layout.width * scale, ch2 = layout.height * scale;
    const focusNode = layout.nodes.find(n => n.id === focusId) ?? layout.nodes.find(n => visibleNodes.find(v => v.id === n.id && v.status === 'current')?.id === n.id);
    let tx = focusNode ? cw / 2 - (focusNode.x + focusNode.w / 2) * scale : (cw - cw2) / 2;
    let ty = focusNode ? ch / 2 - (focusNode.y + focusNode.h / 2) * scale : (ch - ch2) / 2;
    tx = Math.min(Math.max(0, cw - cw2), Math.max(Math.min(0, cw - cw2), tx));
    ty = Math.min(Math.max(0, ch - ch2), Math.max(Math.min(0, ch - ch2), ty));
    setPan({ scale, tx, ty }); interacted.current = false;
  }, [layout, focusId, visibleNodes]);

  useLayoutEffect(() => { fit(); }, [fit]);
  useLayoutEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(en => { const r = en[0].contentRect; if (r.width > 0 && !interacted.current) fit(); });
    ro.observe(el); return () => ro.disconnect();
  }, [fit]);

  const zoomBy = (k: number) => {
    interacted.current = true;
    const el = containerRef.current; if (!el) return;
    const cx = el.clientWidth / 2, cy = el.clientHeight / 2;
    setPan(p => { const scale = Math.min(2, Math.max(0.5, p.scale * k)); const r = scale / p.scale; return { scale, tx: cx - (cx - p.tx) * r, ty: cy - (cy - p.ty) * r }; });
  };
  const onPointerDown = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest('button')) return; drag.current = { x: e.clientX, y: e.clientY, tx: pan.tx, ty: pan.ty, moved: false }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true; if (d.moved) { interacted.current = true; setPan(p => ({ ...p, tx: d.tx + dx, ty: d.ty + dy })); } };
  const onPointerUp = () => { const d = drag.current; drag.current = null; if (d && !d.moved) setFocusId(null); };

  const neighbor = useMemo(() => (focusId ? new Set([focusId, ...graph.edges.filter(e => e.from === focusId || e.to === focusId).flatMap(e => [e.from, e.to])]) : null), [focusId, graph]);
  const inspector = useMemo(() => (focusId ? conceptInspector(stats, focusId, graph.nodes) : null), [focusId, stats, graph]);
  const nodeById = useMemo(() => new Map(layout.nodes.map(n => [n.id, n])), [layout]);

  if (graph.nodes.length === 0) {
    return (
      <section className="kg-panel" aria-label="Knowledge graph">
        <div className="d3-chart-head"><span className="d3-eyebrow">Knowledge Graph</span></div>
        <div className="dempty">The knowledge graph appears once concepts and their prerequisites are published. No placeholder nodes are shown.</div>
      </section>
    );
  }

  return (
    <section className="kg-panel" aria-label="Knowledge graph">
      <div className="d3-chart-head">
        <span className="d3-eyebrow">Knowledge Graph</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className={`btn btn-sm ${view === 'current' ? 'btn-secondary' : 'btn-ghost'}`} aria-pressed={view === 'current'} onClick={() => setView('current')}>Current world</button>
          <button type="button" className={`btn btn-sm ${view === 'all' ? 'btn-secondary' : 'btn-ghost'}`} aria-pressed={view === 'all'} onClick={() => setView('all')}>All worlds</button>
          <select className="input" style={{ width: 140, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} aria-label="Filter nodes by status">
            <option value="ALL">All statuses</option><option value="mastered">Mastered</option><option value="in-progress">In progress</option>
            <option value="available">Available</option><option value="locked">Locked</option>
          </select>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowGraph(v => !v)} aria-expanded={showGraph}>{showGraph ? 'List view' : 'Graph view'}</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">−</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => zoomBy(1.2)} aria-label="Zoom in">+</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setPan({ scale: 1, tx: 0, ty: 0 }); interacted.current = false; }}>Reset</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={fit}>Fit</button>
        </div>
      </div>

      <div className={`kg-wrap ${inspector ? 'has-inspector' : ''}`}>
        <div className={`kg-canvas ${showGraph ? 'open' : ''}`}
          ref={containerRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          role="group" aria-label="Knowledge graph canvas. Use the list below for a keyboard-friendly alternative.">
          <div style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, transform: `translate(${pan.tx}px,${pan.ty}px) scale(${pan.scale})`, transformOrigin: '0 0' }}>
            <svg width={layout.width} height={layout.height} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {visibleEdges.map((e, i) => {
                const a = nodeById.get(e.from), b = nodeById.get(e.to);
                if (!a || !b) return null;
                const dim = neighbor && !(neighbor.has(e.from) && neighbor.has(e.to));
                return (
                  <line key={i} x1={a.x + a.w} y1={a.y + a.h / 2} x2={b.x} y2={b.y + b.h / 2}
                    className={`kg-edge ${e.kind === 'related' ? 'related' : ''} ${dim ? 'dim' : ''}`}
                    strokeDasharray={e.kind === 'related' ? '4 3' : undefined} />
                );
              })}
            </svg>
            {visibleNodes.map(n => {
              const ln = nodeById.get(n.id); if (!ln) return null;
              return (
                <button key={n.id} type="button"
                  className={`kg-node ${STATUS_CLASS[n.status]} ${focusId === n.id ? 'sel' : ''} ${neighbor && !neighbor.has(n.id) ? 'dim' : ''}`}
                  style={{ position: 'absolute', left: 0, top: 0, width: ln.w, height: ln.h, transform: `translate(${ln.x}px,${ln.y}px)` }}
                  onClick={() => setFocusId(focusId === n.id ? null : n.id)}
                  aria-pressed={focusId === n.id}
                  aria-label={`${n.title}, ${n.status}${n.mastery !== null ? `, mastery ${n.mastery}%` : ''}`}>
                  {n.title}
                  <small>{n.mastery !== null ? `${n.mastery}% mastery` : n.status}</small>
                </button>
              );
            })}
          </div>
        </div>

        {inspector && (
          <aside className="kg-inspector" role="region" aria-label={`${inspector.concept.title} details`}>
            <div className="d-title">{inspector.concept.title}</div>
            <div className="d-micro">mastery {inspector.mastery ?? '—'}% · completion {inspector.completion ?? '—'}%</div>
            <div className="d-micro">practice accuracy {inspector.accuracy === null ? '—' : `${inspector.accuracy}%`}{inspector.confidence !== null ? ` · confidence ${inspector.confidence}/3` : ''}</div>
            {inspector.prereqs.length > 0 && (
              <div><div className="d3-eyebrow" style={{ margin: '8px 0 4px' }}>Prerequisites</div>
                {inspector.prereqs.map(p => <button key={p.id} className="chip2" onClick={() => setFocusId(p.id)}>{p.title} · {p.status}</button>)}
              </div>
            )}
            {inspector.dependents.length > 0 && (
              <div><div className="d3-eyebrow" style={{ margin: '8px 0 4px' }}>Unlocks</div>
                {inspector.dependents.map(p => <button key={p.id} className="chip2" onClick={() => setFocusId(p.id)}>{p.title}</button>)}
              </div>
            )}
            <div className="d-micro" style={{ marginTop: 8, color: 'var(--action-text)' }}>{inspector.nextAction}</div>
          </aside>
        )}
      </div>

      {/* List-based accessible alternative (always available; primary on mobile) */}
      <div className="kg-list" role="list" aria-label="Concept list">
        {visibleNodes.map(n => (
          <button key={n.id} role="listitem" type="button" className={`kg-list-item ${STATUS_CLASS[n.status]}`} onClick={() => setFocusId(n.id)} aria-pressed={focusId === n.id}>
            <span className="kg-list-title">{n.title}</span>
            <span className="kg-list-meta">{n.status}{n.mastery !== null ? ` · ${n.mastery}%` : ''}</span>
          </button>
        ))}
      </div>

      <div className="kg-legend">
        <span><span className="kg-swatch kg-mastered" /> mastered</span>
        <span><span className="kg-swatch kg-progress" /> in progress</span>
        <span><span className="kg-swatch kg-available" /> available</span>
        <span><span className="kg-swatch kg-locked" /> locked</span>
        <span><span className="kg-swatch kg-current" /> current</span>
        <span><span className="kg-line" /> prerequisite</span>
        <span><span className="kg-line dashed" /> related</span>
      </div>
    </section>
  );
}
