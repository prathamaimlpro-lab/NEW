import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { Chip } from '../common/ui';

interface Step { type: 'compare' | 'swap' | 'mark' | 'done'; i: number; j: number; arr: number[]; text: string; line: number }

const PSEUDO = ['for end = n-1 … 1', '  for j = 0 … end-1', '    compare a[j], a[j+1]', '    swap if out of order', '  mark a[end] sorted', 'mark a[0] sorted', 'done'];

function randomArray(n: number): number[] { return Array.from({ length: n }, () => 10 + Math.floor(Math.random() * 90)); }

function buildSteps(input: number[], desc: boolean): Step[] {
  const arr = [...input]; const steps: Step[] = [];
  const push = (type: Step['type'], i: number, j: number, text: string, line: number) => steps.push({ type, i, j, arr: [...arr], text, line });
  for (let end = arr.length - 1; end > 0; end--) {
    for (let j = 0; j < end; j++) {
      push('compare', j, j + 1, `Compare ${arr[j]} and ${arr[j + 1]}.`, 2);
      const bad = desc ? arr[j] < arr[j + 1] : arr[j] > arr[j + 1];
      if (bad) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; push('swap', j, j + 1, `Out of order — swap ${arr[j + 1]} and ${arr[j]}.`, 3); }
    }
    push('mark', end, end, `Index ${end} is now in its final position.`, 4);
  }
  push('mark', 0, 0, 'Index 0 is in its final position.', 5);
  push('done', -1, -1, desc ? 'Sorting complete — descending order.' : 'Sorting complete — ascending order.', 6);
  return steps;
}

export function BubbleSortViz({ onComplete }: { onComplete?: () => void }) {
  const [seed, setSeed] = useState<number[]>(() => randomArray(8));
  const [desc, setDesc] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const fired = useRef(false);
  const steps = useMemo(() => buildSteps(seed, desc), [seed, desc]);

  useEffect(() => { setIdx(0); setPlaying(false); fired.current = false; }, [steps]);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIdx(i => { if (i >= steps.length - 1) { setPlaying(false); return i; } return i + 1; }), 900 / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, steps]);

  const cur = steps[idx];
  const meta = useMemo(() => {
    let c = 0, s = 0; const sorted = new Set<number>();
    for (let k = 0; k <= idx; k++) { const st = steps[k]; if (st.type === 'compare') c++; if (st.type === 'swap') s++; if (st.type === 'mark') sorted.add(st.i); }
    return { c, s, sorted };
  }, [idx, steps]);

  useEffect(() => { if (cur.type === 'done' && !fired.current) { fired.current = true; onComplete?.(); } }, [cur, onComplete]);

  const max = Math.max(...cur.arr);
  const color = (pos: number) => {
    if (meta.sorted.has(pos) || cur.type === 'done') return 'var(--success)';
    if ((cur.type === 'compare' || cur.type === 'swap') && (pos === cur.i || pos === cur.j)) return cur.type === 'swap' ? 'var(--error)' : 'var(--warning)';
    return 'var(--primary)';
  };

  return (
    <div className="card" style={{ background: 'var(--canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <span className="label-mono" style={{ color: 'var(--fg-secondary)' }}>STEP {String(idx + 1).padStart(2, '0')} OF {String(steps.length).padStart(2, '0')} · <span style={{ color: 'var(--fg-primary)' }}>BUBBLE SORT</span></span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { if (!playing && idx >= steps.length - 1) setIdx(0); setPlaying(v => !v); }} aria-pressed={playing}><Icon name="play" size={12} /> {playing ? 'Pause' : 'Play'}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setPlaying(false); setIdx(i => Math.min(steps.length - 1, i + 1)); }}>Step <Icon name="chevron-right" size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setPlaying(false); setIdx(0); }}>Reset</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSeed(randomArray(8))}><Icon name="bolt" size={12} /> Randomize</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setDesc(v => !v)} aria-pressed={desc}>{desc ? 'DESC' : 'ASC'}</button>
          <select className="input" style={{ width: 76, height: 32 }} value={speed} onChange={e => setSpeed(Number(e.target.value))} aria-label="Speed">
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 160, padding: '8px 4px', background: 'var(--elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
        {cur.arr.map((v, pos) => (
          <div key={pos} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>{v}</span>
            <div style={{ width: '100%', height: `${(v / max) * 78}%`, background: color(pos), borderRadius: 'var(--r-sm)', transition: 'height .2s ease, background .2s ease' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <Chip>COMPARISONS {meta.c}</Chip><Chip>SWAPS {meta.s}</Chip>
        <Chip tone="warning">TIME O(n²)</Chip><Chip tone="info">SPACE O(1)</Chip>
      </div>

      <div style={{ background: 'var(--elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 16 }}>
        <p className="t-body" style={{ color: 'var(--fg-secondary)', minHeight: 22 }}>{cur.text}</p>
        <pre style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '18px' }}>
          {PSEUDO.map((line, i) => (
            <div key={i} style={{ color: i === cur.line ? '#a5a1ff' : 'var(--fg-subtle)', background: i === cur.line ? 'var(--primary-subtle)' : 'transparent', borderRadius: 4, padding: '0 6px' }}>{line}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
