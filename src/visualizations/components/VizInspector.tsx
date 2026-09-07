import { ArrayVizStep } from '../types';

export function VizInspector({ step, index, total }: { step: ArrayVizStep; index: number; total: number }) {
  const a = step.active ? step.items[step.active[0]] : null;
  const b = step.active ? step.items[step.active[1]] : null;
  const action = step.kind === 'swap' ? 'Swapped' : step.kind === 'no-swap' ? 'No swap' : step.kind === 'compare' ? 'Comparing' : step.kind === 'pass-complete' ? 'Pass finished' : step.kind === 'sorted' ? 'Complete' : 'Ready';
  const rows: [string, string][] = [
    ['Step', `${index + 1} / ${total}`],
    ['Pass', String(step.pass)],
    ['Comparisons', String(step.comparisons)],
    ['Swaps', String(step.swaps)],
    ['Examining', a && b ? `${a.value} & ${b.value}` : '—'],
    ['Last action', action],
    ['Locked sorted', `${step.items.length - step.sortedFrom} / ${step.items.length}`],
  ];
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="label-mono" style={{ marginBottom: 12 }}>INSPECTOR</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        {rows.map(([k, v]) => (
          <div key={k}><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>{k}</div><div className="t-body mono" style={{ color: 'var(--fg-primary)' }}>{v}</div></div>
        ))}
      </div>
      <div className="label-mono" style={{ margin: '12px 0 6px' }}>CURRENT ARRAY</div>
      <p className="mono t-body-sm" style={{ color: 'var(--fg-secondary)', wordBreak: 'break-word' }}>{step.items.map(i => i.value).join(', ')}</p>
      <div style={{ marginTop: 12, background: 'var(--canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 12 }}>
        <p className="t-body" style={{ color: 'var(--fg-secondary)', minHeight: 44 }}>{step.explanation}</p>
      </div>
    </div>
  );
}
