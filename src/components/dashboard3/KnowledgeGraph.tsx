import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildConceptGraph, conceptInspector, type GraphNodeStatus } from '../../dashboard/graphSelectors';
import { levels } from '../../data/curriculum';
import { listAll } from '../../services/contentService';
import { layeredLayout } from '../../services/graphLayout';
import { SegmentedTabs } from '../ui/primitives';
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
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const interacted = useRef(false);

  const graph = useMemo(() => buildConceptGraph(stats), [stats]);
  const currentWorld = useMemo(() => graph.nodes.find(n => n.status === 'current')?.worldNumber ?? null, [graph]);

  const visibleNodes = useMemo(() => graph.nodes.filter(n => {
    if (view === 'current' && currentWorld !== null && n.worldNumber !== currentWorld) {
      const connected = graph.edges.some(e => e.from === n.id || e.to === n.id);
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

  const nodeById = useMemo(() => new Map(layout.nodes.map(n => [n.id, n])), [layout]);

  const fit = useMemo(() => () => {
    const el = containerRef.current;
    if (!el || layout.width === 0 || layout.height === 0) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const scale = Math.min(cw / layout.width, ch / layout.height, 1);
    const cw2 = layout.width * scale, ch2 = layout.height * scale;
    const focusNode = layout.nodes.find(n => n.id === focusId)
      ?? layout.nodes.find(n => visibleNodes.find(v => v.id === n.id && v.status === 'current')?.id === n.id);
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

  const zoomBy = (k: number, cx?: number, cy?: number) => {
    interacted.current = true;
    const el = containerRef.current; if (!el) return;
    const px = cx ?? el.clientWidth / 2, py = cy ?? el.clientHeight / 2;
    setPan(p => {
      const scale = Math.min(2.5, Math.max(0.4, p.scale * k));
      const r = scale / p.scale;
      return { scale, tx: px - (px - p.tx) * r, ty: py - (py - p.ty) * r };
    });
  };

  /* ctrl/meta+wheel always zooms; plain wheel zooms only once the canvas has focus */
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const focused = el.contains(document.activeElement);
      if (e.ctrlKey || e.metaKey || focused) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button.kg-node')) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    } else {
      drag.current = { x: e.clientX, y: e.clientY, tx: pan.tx, ty: pan.ty, moved: false };
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchDist.current !== null) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0 && pinchDist.current > 0) zoomBy(d / pinchDist.current);
      pinchDist.current = d;
      return;
    }
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) { interacted.current = true; setPan(p => ({ ...p, tx: d.tx + dx, ty: d.ty + dy })); }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = null;
    const d = drag.current; drag.current = null;
    if (d && !d.moved) setFocusId(null);
  };

  const onCanvasKey = (e: React.KeyboardEvent) => {
    const nodes = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button.kg-node'));
    if (nodes.length === 0) return;
    const i = nodes.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); nodes[(i + 1 + nodes.length) % nodes.length].focus(); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); nodes[(i - 1 + nodes.length) % nodes.length].focus(); }
  };

  const neighbor = useMemo(() => (focusId ? new Set([focusId, ...graph.edges.filter(e => e.from === focusId || e.to === focusId).flatMap(e => [e.from, e.to])]) : null), [focusId, graph]);
  const inspector = useMemo(() => (focusId ? conceptInspector(stats, focusId, graph.nodes) : null), [focusId, stats, graph]);
  const inspectorNode = inspector ? graph.nodes.find(n => n.id === inspector.concept.id) : undefined;
  const inspectorLevel = useMemo(() => {
    if (!inspector) return undefined;
    const lesson = listAll('lessons').find(l => l.conceptIds.includes(inspector.concept.id));
    return lesson ? levels.find(l => l.id === lesson.levelId) : undefined;
  }, [inspector]);

  if (graph.nodes.length === 0) {
    return (
      <section className="kg-panel" aria-label="Knowledge graph">
        <div className="dempty">The knowledge graph appears once concepts and their prerequisites are published.</div>
      </section>
    );
  }

  return (
    <section className="kg-panel" aria-label="Knowledge graph">
      <div className="kg-toolbar">
        <SegmentedTabs
          ariaLabel="Graph scope"
          value={view}
          onChange={v => setView(v as 'current' | 'all')}
          options={[{ value: 'current', label: 'Current world' }, { value: 'all', label: 'All worlds' }]}
        />
        <select className="input" style={{ height: 36, width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} aria-label="Filter nodes by status">
          <option value="ALL">All statuses</option>
          <option value="mastered">Mastered</option>
          <option value="in-progress">In progress</option>
          <option value="available">Available</option>
          <option value="locked">Locked</option>
        </select>
        <span style={{ flex: 1 }} />
        <button type="button" className="btn btn-ghost btn-sm kg-toggle" aria-pressed={showGraph} onClick={() => setShowGraph(v => !v)}>
          {showGraph ? 'List view' : 'Graph view'}
        </button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}>−</button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Zoom in" onClick={() => zoomBy(1.2)}>+</button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Reset view" onClick={() => { setPan({ scale: 1, tx: 0, ty: 0 }); interacted.current = false; }}>⟲</button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Fit to screen" onClick={fit}>⤢</button>
      </div>

      <div className={`kg-wrap ${inspector ? 'has-inspector' : ''}`}>
        <div
          className={`kg-canvas ${showGraph ? 'open' : ''}`}
          ref={containerRef}
          role="group"
          aria-label="Knowledge graph canvas. Drag or use one finger to pan, pinch or control-wheel to zoom, arrow keys to move between nodes, Enter to select. A list alternative follows."
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onKeyDown={onCanvasKey}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, transform: `translate(${pan.tx}px,${pan.ty}px) scale(${pan.scale})`, transformOrigin: '0 0' }}>
            <svg width={layout.width} height={layout.height} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              {visibleEdges.map((e, i) => {
                const a = nodeById.get(e.from), b = nodeById.get(e.to);
                if (!a || !b) return null;
                const dim = neighbor && !(neighbor.has(e.from) && neighbor.has(e.to));
                return (
                  <line key={i} x1={a.x + a.w} y1={a.y + a.h / 2} x2={b.x} y2={b.y + b.h / 2}
                    className={`kg-edge ${e.kind === 'related' ? 'related' : ''} ${dim ? 'dim' : ''}`} />
                );
              })}
            </svg>
            {visibleNodes.map(n => {
              const ln = nodeById.get(n.id); if (!ln) return null;
              return (
                <button key={n.id} type="button"
                  className={`kg-node ${STATUS_CLASS[n.status]} ${focusId === n.id ? 'sel' : ''} ${neighbor && !neighbor.has(n.id) ? 'dim' : ''}`}
                  style={{ position: 'absolute', left: 0, top: 0, width: Math.max(140, ln.w), height: Math.max(44, ln.h), transform: `translate(${ln.x}px,${ln.y}px)` }}
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
            <div className="kg-handle" aria-hidden="true" />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <span className="ui-h2">{inspector.concept.title}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFocusId(null)} aria-label="Close details">✕</button>
            </div>
            <span className={`chip ${inspectorNode?.status === 'mastered' ? 'chip-success' : inspectorNode?.status === 'locked' ? '' : 'chip-warning'}`}>
              {inspectorNode?.status ?? 'available'}
            </span>
            <div className="ui-mono">Level: {inspectorLevel ? `${inspectorLevel.number} · ${inspectorLevel.title}` : '—'}</div>
            <div className="ui-mono ui-muted">
              mastery {inspector.mastery ?? '—'}% · completion {inspector.completion ?? '—'}%
              {inspector.accuracy !== null ? ` · practice ${inspector.accuracy}%` : ''}
            </div>
            {inspector.prereqs.length > 0 && (
              <div>
                <div className="ui-index" style={{ margin: '8px 0 4px' }}>Needs first</div>
                {inspector.prereqs.map(p => (
                  <button key={p.id} type="button" className="kg-list-item" onClick={() => setFocusId(p.id)}>
                    <span>{p.title}</span><span className="ui-mono">{p.status}</span>
                  </button>
                ))}
              </div>
            )}
            {inspector.dependents.length > 0 && (
              <div className="ui-mono ui-muted" style={{ marginTop: 6 }}>Unlocks {inspector.dependents.length} concept{inspector.dependents.length === 1 ? '' : 's'}</div>
            )}
            <div style={{ marginTop: 10 }}>
              {inspectorNode?.status === 'locked'
                ? <Link className="btn btn-secondary" to="/learn">Open in Curriculum</Link>
                : <Link className="btn btn-primary" to={inspectorLevel ? `/learn/level/${inspectorLevel.id}` : '/learn'}>Start level</Link>}
            </div>
          </aside>
        )}
      </div>

      <div className="kg-list" role="list" aria-label="Concept list">
        {visibleNodes.map(n => (
          <button key={n.id} role="listitem" type="button" className={`kg-list-item ${STATUS_CLASS[n.status]}`} onClick={() => setFocusId(n.id)} aria-pressed={focusId === n.id}>
            <span className="kg-list-title">{n.title}</span>
            <span className="kg-list-meta">{n.status}{n.mastery !== null ? ` · ${n.mastery}%` : ''}</span>
          </button>
        ))}
      </div>

      <div className="kg-legend">
        <span><span className="kg-swatch kg-mastered" aria-hidden="true" />mastered</span>
        <span><span className="kg-swatch kg-progress" aria-hidden="true" />in progress</span>
        <span><span className="kg-swatch kg-available" aria-hidden="true" />available</span>
        <span><span className="kg-swatch kg-locked" aria-hidden="true" />locked</span>
        <span><span className="kg-swatch kg-current" aria-hidden="true" />current</span>
        <span><span className="kg-line" aria-hidden="true" />prerequisite</span>
        <span><span className="kg-line dashed" aria-hidden="true" />related</span>
      </div>
    </section>
  );
}
