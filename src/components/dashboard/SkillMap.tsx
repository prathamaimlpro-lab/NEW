import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { layeredLayout } from '../../services/graphLayout';
import { getRevisionDue } from '../../services/progressService';
import type { ConceptNode, SkillGraph } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

type Category = 'completed' | 'in-progress' | 'available' | 'locked';
const categoryOf = (n: ConceptNode): Category =>
  n.state === 'locked' ? 'locked' : n.completion >= 100 ? 'completed' : (n.completion > 0 || n.state === 'current') ? 'in-progress' : 'available';

const STATE_CLASS: Record<ConceptNode['state'], string> = {
  mastered: 'sk-mastered', strong: 'sk-strong', developing: 'sk-developing',
  weak: 'sk-weak', locked: 'sk-locked', current: 'sk-current', unknown: '',
};

export function SkillMap({ graph }: { graph: SkillGraph }) {
  const { stats } = usePlayer();
  const [view, setView] = useState<'current' | 'all'>('current');
  const [stateFilter, setStateFilter] = useState<'ALL' | Category>('ALL');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [pan, setPan] = useState({ scale: 1, tx: 0, ty: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const interacted = useRef(false);

  const currentWorldId = graph.nodes.find(n => n.state === 'current')?.worldId ?? null;

  const visibleNodes = useMemo(() => {
    let base = graph.nodes;
    if (view === 'current' && currentWorldId) {
      const core = graph.nodes.filter(n => n.worldId === currentWorldId);
      const ids = new Set(core.map(n => n.id));
      for (const n of core) { n.prerequisiteIds.forEach(id => ids.add(id)); n.dependentIds.forEach(id => ids.add(id)); }
      base = graph.nodes.filter(n => ids.has(n.id));
    }
    if (stateFilter !== 'ALL') base = base.filter(n => categoryOf(n) === stateFilter);
    return base;
  }, [graph, view, stateFilter, currentWorldId]);

  const visibleIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => graph.edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to)), [graph.edges, visibleIds]);

  const layout = useMemo(() => layeredLayout(
    visibleNodes.map(n => ({
      id: n.id,
      prerequisiteIds: n.prerequisiteIds,
      dependentIds: n.dependentIds,
      worldNumber: Number(n.worldId.replace('world-', '')) || 0,
      centrality: n.dependentIds.length,
    })),
    visibleEdges,
  ), [visibleNodes, visibleEdges]);

  const fit = useMemo(() => () => {
    const el = containerRef.current;
    if (!el || layout.width === 0 || layout.height === 0) return;
    const cw = el.clientWidth; const ch = el.clientHeight;
    const scale = Math.min(cw / layout.width, ch / layout.height, 1);
    const focus = graph.nodes.find(n => n.state === 'current');
    const fn = focus ? layout.nodes.find(n => n.id === focus.id) : undefined;
    const tx = fn ? cw / 2 - (fn.x + fn.w / 2) * scale : (cw - layout.width * scale) / 2;
    const ty = fn ? ch / 2 - (fn.y + fn.h / 2) * scale : (ch - layout.height * scale) / 2;
    setPan({ scale, tx, ty });
    interacted.current = false;
  }, [layout, graph.nodes]);

  useLayoutEffect(() => { fit(); }, [fit]);
  useLayoutEffect(() => {
    const onResize = () => { if (!interacted.current) fit(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fit]);

  const zoomBy = (k: number) => {
    interacted.current = true;
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth / 2; const ch = el.clientHeight / 2;
    setPan(p => {
      const scale = Math.min(2, Math.max(0.5, p.scale * k));
      const real = scale / p.scale;
      return { scale, tx: cw - (cw - p.tx) * real, ty: ch - (ch - p.ty) * real };
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, tx: pan.tx, ty: pan.ty, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x; const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) { interacted.current = true; setPan(p => ({ ...p, tx: d.tx + dx, ty: d.ty + dy })); }
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setFocusId(null);
  };

  const focus = focusId ? graph.nodes.find(n => n.id === focusId) ?? null : null;
  const neighbor = useMemo(() => (focus ? new Set([focus.id, ...focus.prerequisiteIds, ...focus.dependentIds]) : null), [focus]);
  const revision = getRevisionDue(stats);
  const nodeById = useMemo(() => new Map(layout.nodes.map(n => [n.id, n])), [layout]);

  if (graph.nodes.length === 0) {
    return (
      <section className="p-map">
        <div className="p-head"><span className="d-eyebrow">Skill Relationship Map</span></div>
        <div className="dempty">The relationship map appears as curriculum topics and their prerequisites become available. No graph is fabricated before real relationships exist.</div>
      </section>
    );
  }

  return (
    <section className="p-map">
      <div className="p-head">
        <span className="d-eyebrow">Skill Relationship Map</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className={`btn btn-sm ${view === 'current' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('current')} aria-pressed={view === 'current'}>Current world</button>
          <button type="button" className={`btn btn-sm ${view === 'all' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('all')} aria-pressed={view === 'all'}>All worlds</button>
          <select className="input" style={{ width: 140, height: 32 }} value={stateFilter} onChange={e => setStateFilter(e.target.value as 'ALL' | Category)} aria-label="Filter nodes by state">
            <option value="ALL">All states</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In progress</option>
            <option value="available">Available</option>
            <option value="locked">Locked</option>
          </select>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">−</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => zoomBy(1.2)} aria-label="Zoom in">+</button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => fit()}>Fit</button>
          <button type="button" className={`btn btn-sm ${showList ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setShowList(v => !v)} aria-expanded={showList}>Node list</button>
        </div>
      </div>

      {visibleNodes.length === 0 ? (
        <div className="dempty">No concepts match this filter. Clear the state filter or switch to all worlds.</div>
      ) : (
        <div className={`sk-wrap ${focus ? 'has-detail' : ''}`}>
          <div
            ref={containerRef}
            className="sk-viewport"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ position: 'relative', overflow: 'hidden', height: 'clamp(360px, 52vh, 560px)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 8, touchAction: 'none', cursor: 'grab' }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, transform: `translate(${pan.tx}px, ${pan.ty}px) scale(${pan.scale})`, transformOrigin: '0 0' }}>
              <svg className="sk-edges" width={layout.width} height={layout.height} aria-hidden="true">
                <defs>
                  <marker id="sk-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="var(--border-strong)" />
                  </marker>
                </defs>
                {layout.edges.map((e, i) => (
                  <line key={i} x1={e.x1} y1={e.y1} x2={e.x2 - 4} y2={e.y2} markerEnd="url(#sk-arrow)"
                    className={focus && !(e.from === focus.id || e.to === focus.id) ? 'fade' : ''} />
                ))}
              </svg>
              {visibleNodes.map(n => {
                const ln = nodeById.get(n.id)!;
                const sizeClass = n.dependentIds.length >= 3 ? 'sz2' : n.dependentIds.length >= 1 ? 'sz1' : '';
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`sk-node ${sizeClass} ${STATE_CLASS[n.state]} ${focusId === n.id ? 'sel' : ''} ${neighbor && !neighbor.has(n.id) ? 'fade' : ''}`}
                    style={{ position: 'absolute', left: 0, top: 0, width: ln.w, height: ln.h, transform: `translate(${ln.x}px, ${ln.y}px)`, transition: 'transform .2s ease, opacity .18s ease, border-color .15s ease, background-color .15s ease' }}
                    onClick={() => setFocusId(focusId === n.id ? null : n.id)}
                    aria-label={`${n.id}, ${n.state}${n.hasData ? `, mastery ${n.mastery}%` : ''}, ${categoryOf(n)}`}
                  >
                    {n.id}
                    <small className={sizeClass === '' ? 'hide' : undefined}>{n.hasData ? `${n.mastery}% · ${n.completion}% done` : categoryOf(n)}</small>
                  </button>
                );
              })}
            </div>
          </div>

          {focus && (
            <div className="sk-detail">
              <div className="d-title">{focus.id}</div>
              <div className="d-micro">{focus.state} · {categoryOf(focus)} · {focus.hasData ? `mastery ${focus.mastery}% · completion ${focus.completion}%` : 'no mastery data yet'}</div>
              <div className="d-micro" style={{ color: 'var(--text-muted)' }}>
                Curriculum: {focus.levelIds.length ? focus.levelIds.map(l => `L${l}`).join(', ') : 'no levels yet'}
              </div>
              {focus.prerequisiteIds.length > 0 && (
                <div>
                  <div className="d-micro" style={{ marginBottom: 6 }}>PREREQUISITES</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {focus.prerequisiteIds.map(id => <button key={id} type="button" className="chip2" onClick={() => setFocusId(id)}>{id}</button>)}
                  </div>
                </div>
              )}
              {focus.dependentIds.length > 0 && (
                <div>
                  <div className="d-micro" style={{ marginBottom: 6 }}>UNLOCKS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {focus.dependentIds.map(id => <button key={id} type="button" className="chip2" onClick={() => setFocusId(id)}>{id}</button>)}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link className="cta-outline" style={{ minHeight: 32, fontSize: 13 }} to="/practice">Practice this</Link>
                {revision.some(r => r.kind === 'lesson' && focus.lessonIds.includes(r.id)) && (
                  <Link className="cta-outline" style={{ minHeight: 32, fontSize: 13 }} to={`/learn/lesson/${focus.lessonIds[0]}`}>Review this</Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showList && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="d-micro" style={{ marginBottom: 4 }}>Accessible node list (keyboard usable)</div>
          {visibleNodes.map(n => (
            <button key={n.id} type="button" className="lrow" style={{ textAlign: 'left' }} onClick={() => setFocusId(focusId === n.id ? null : n.id)} aria-pressed={focusId === n.id}>
              <span className="rail"><span className="dot" style={{ background: n.state === 'locked' ? 'var(--text-subtle)' : n.completion >= 100 ? 'var(--signal-mastered)' : n.state === 'current' ? 'var(--signal-focus)' : 'var(--border-strong)' }} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="d-body" style={{ color: 'var(--text-primary)', display: 'block' }}>{n.id}</span>
                <span className="d-micro">{n.state} · {categoryOf(n)}{n.hasData ? ` · mastery ${n.mastery}%` : ''}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }} className="d-micro">
        {(['mastered', 'strong', 'developing', 'weak', 'locked'] as const).map(s => (
          <span key={s} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span className={`sk-node ${STATE_CLASS[s]}`} style={{ position: 'static', width: 10, height: 10, borderRadius: 2, display: 'inline-block', padding: 0 }} /> {s}
          </span>
        ))}
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, boxShadow: '0 0 0 2px var(--signal-focus)', display: 'inline-block' }} /> current focus
        </span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 18, height: 0, borderTop: '1.5px solid var(--border-strong)', display: 'inline-block' }} /> solid = prerequisite
        </span>
        <span style={{ color: 'var(--text-muted)' }}>Dashed related-concept edges appear when curriculum data includes them.</span>
      </div>
    </section>
  );
}
