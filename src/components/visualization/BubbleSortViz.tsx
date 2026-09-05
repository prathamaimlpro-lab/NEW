import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { Chip } from '../common/ui';

interface Item { id: number; v: number }
interface Step { type: 'compare' | 'swap' | 'mark' | 'done'; i: number; j: number; items: Item[]; text: string; line: number }

const PSEUDO = ['for end = n-1 … 1', '  for j = 0 … end-1', '    compare a[j], a[j+1]', '    swap if out of order', '  mark a[end] sorted', 'mark a[0] sorted', 'done'];

let nextId = 1;
const randomItems = (n: number): Item[] => Array.from({ length: n }, () => ({ id: nextId++, v: 10 + Math.floor(Math.random() * 90) }));

function buildSteps(input: Item[], desc: boolean): Step[] {
  const arr = [...input]; const steps: Step[] = [];
  const push = (type: Step['type'], i: number, j: number, text: string, line: number) => steps.push({ type, i, j, items: arr.map(x => ({ ...x })), text, line });
  for (let end = arr.length - 1; end > 0; end--) {
    for (let j = 0; j < end; j++) {
      push('compare', j, j + 1, `Compare ${arr[j].v} and ${arr[j + 1].v}.`, 2);
      const bad = desc ? arr[j].v < arr[j + 1].v : arr[j].v > arr[j + 1].v;
      if (bad) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; push('swap', j, j + 1, `Swap ${arr[j + 1].v} and ${arr[j]}.`, 3); }
    }
    push('mark', end, end, `Index ${end} is locked in its final position.`, 4);
  }
  push('mark', 0, 0, 'Index 0 is locked.', 5);
  push('done', -1, -1, desc ? 'Sorting complete — descending order.' : 'Sorting complete — ascending order.', 6);
  return steps;
}

export function BubbleSortViz({ onComplete }: { onComplete?: () => void }) {
  const [seed, setSeed] = useState<Item[]>(() => randomItems(8));
  const [desc, setDesc] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const fired = useRef(false);
  const steps = useMemo(() => buildSteps(seed, desc), [seed, desc]);

  useEffect(() => { setIdx(0); setPlaying(false); fired.current = false; }, [steps]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIdx(i => { if (i >= steps.length - 1) { setPlaying(false); return i; } return i + 1; }), 850 / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, steps]);

  const cur = steps[idx];
  const meta = useMemo(() => {
    let c = 0, s = 0; const sorted = new Set<number>();
    for (let k = 0; k <= idx; k++) { const st = steps[k]; if (st.type === 'compare') c++; if (st.type === 'swap') s++; if (st.type === 'mark') sorted.add(st.i); }
    return { c, s, sorted };
  }, [idx, steps]);

  useEffect(() => { if (cur.type === 'done' && !fired.current) { fired.current = true; onComplete?.(); } }, [cur, onComplete]);

  const max = Math.max(...cur.items.map(x => x.v));
  const n = cur.items.length;
  const colorFor = (slot: number) => {
    if (cur.type === 'done' || meta.sorted.has(slot)) return 'var(--success)';
    if ((cur.type === 'compare' || cur.type === 'swap') && (slot === cur.i || slot === cur.j)) return cur.type === 'swap' ? 'var(--error)' : 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => { if (!playing && idx >= steps.length - 1) setIdx(0); setPlaying(v => !v); }} aria-pressed={playing}>
          <Icon name="play" size={14} /> {playing ? 'Pause' : 'Play'}
        </button>
        <button className="btn btn-secondary" onClick={() => { setPlaying(false); setIdx(i => Math.min(steps.length - 1, i + 1)); }}>Step <Icon name="chevron-right" size={14} /></button>
        <button className="btn btn-secondary" onClick={() => { setPlaying(false); setIdx(0); }}>Reset</button>
        <button className="btn btn-secondary" onClick={() => setSeed(randomItems(8))}><Icon name="bolt" size={14} /> Randomize</button>
        <button className="btn btn-ghost" onClick={() => setDesc(v => !v)} aria-pressed={desc}>{desc ? 'Descending' : 'Ascending'}</button>
        <select className="input" style={{ width: 84 }} value={speed} onChange={e => setSpeed(Number(e.target.value))} aria-label="Playback speed">
          <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
        </select>
      </div>

      <div className="viz-stage" aria-label="Bubble sort visualization">
        {cur.items.map((it, slot) => (
          <div key={it.id} className="viz-slot" style={{ width: `${100 / n}%`, transform: `translateX(${slot * 100}%)` }}>
            <span className="viz-val mono">{it.v}</span>
            <div className="viz-bar" style={{ height: `${(it.v / max) * 78}%`, background: colorFor(slot) }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div><div className="label-mono">STEP</div><div className="t-hmd mono">{idx + 1} / {steps.length}</div></div>
        <div><div className="label-mono">COMPARISONS</div><div className="t-hmd mono">{meta.c}</div></div>
        <div><div className="label-mono">SWAPS</div><div className="t-hmd mono">{meta.s}</div></div>
        <div><div className="label-mono">SIZE</div><div className="t-hmd mono">{n}</div></div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>INSPECTOR</div>
          <p className="t-body" style={{ color: 'var(--fg-secondary)', minHeight: 44 }}>{cur.text}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--primary)' }} /> Unsorted</span>
            <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--warning)' }} /> Comparing</span>
            <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--error)' }} /> Swapping</span>
            <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)' }} /> Sorted</span>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>PSEUDOCODE</div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '20px' }}>
            {PSEUDO.map((line, i) => (
              <div key={i} style={{ color: i === cur.line ? 'var(--accent-soft)' : 'var(--fg-subtle)', background: i === cur.line ? 'var(--primary-subtle)' : 'transparent', borderRadius: 4, padding: '0 6px', transition: 'background .2s ease' }}>{line}</div>
            ))}
          </pre>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><Chip tone="warning">TIME O(n²)</Chip><Chip tone="info">SPACE O(1)</Chip></div>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>CONCEPT</div>
        <p className="t-body-sm">Bubble Sort repeatedly walks the array, comparing neighbours and swapping them when out of order. Each full pass pushes the largest remaining value to the end — like a bubble rising to the surface. It is rarely used in practice, but it is the perfect first model for reasoning about comparisons, swaps, and O(n²) time.</p>
      </div>
    </div>
  );
}
