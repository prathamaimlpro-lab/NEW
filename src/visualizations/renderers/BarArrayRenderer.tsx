import { ArrayVizStep } from '../types';

export function BarArrayRenderer({ step }: { step: ArrayVizStep }) {
  const n = step.items.length;
  const max = Math.max(...step.items.map(i => i.value));
  const isActive = (slot: number) => !!step.active && (slot === step.active[0] || slot === step.active[1]);
  const colorFor = (slot: number) => {
    if (step.kind === 'sorted' || slot >= step.sortedFrom) return 'var(--success)';
    if (isActive(slot)) return step.kind === 'swap' ? 'var(--error)' : 'var(--warning)';
    return 'var(--primary)';
  };
  const labelFor = (slot: number) => {
    if (step.kind === 'sorted' || slot >= step.sortedFrom) return '✓';
    if (step.active && slot === step.active[0]) return 'A';
    if (step.active && slot === step.active[1]) return 'B';
    return '·';
  };
  return (
    <div className="viz-stage" role="img" aria-label={`Array: ${step.items.map(i => i.value).join(', ')}. ${step.explanation}`}>
      {step.items.map((it, slot) => (
        <div key={it.id} className="viz-slot" style={{ width: `${100 / n}%`, transform: `translateX(${slot * 100}%)` }}>
          <span className="viz-val mono">{it.value}</span>
          <div className="viz-bar" style={{ height: `${(it.value / max) * 70}%`, background: colorFor(slot), boxShadow: isActive(slot) ? '0 0 0 1px var(--fg-primary)' : undefined }} />
          <span className="viz-val mono" style={{ minHeight: 14, color: labelFor(slot) === '·' ? 'transparent' : 'var(--fg-primary)' }}>{labelFor(slot)}</span>
        </div>
      ))}
    </div>
  );
}
