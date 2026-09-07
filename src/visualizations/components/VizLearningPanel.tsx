import { ArrayAlgorithm, ArrayVizStep } from '../types';

export function VizLearningPanel({ algorithm, step }: { algorithm: ArrayAlgorithm; step: ArrayVizStep }) {
  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 16 }}>
        <div className="label-mono" style={{ marginBottom: 12 }}>COMPLEXITY</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 12 }}>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Best</div><div className="mono t-body" style={{ color: 'var(--success)' }}>{algorithm.complexity.best}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Average</div><div className="mono t-body" style={{ color: 'var(--warning)' }}>{algorithm.complexity.average}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Worst</div><div className="mono t-body" style={{ color: 'var(--error)' }}>{algorithm.complexity.worst}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Space</div><div className="mono t-body" style={{ color: 'var(--info)' }}>{algorithm.complexity.space}</div></div>
        </div>
        <p className="t-body-sm">{algorithm.complexityExplained}</p>
        <div className="label-mono" style={{ margin: '14px 0 8px' }}>LEGEND</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--primary)' }} /> Unsorted</span>
          <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--warning)' }} /> Comparing (A & B)</span>
          <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--error)' }} /> Swapping</span>
          <span className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)' }} /> Sorted / locked (✓)</span>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="label-mono" style={{ marginBottom: 12 }}>PSEUDOCODE</div>
        <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '20px' }}>
          {algorithm.pseudocode.map((line, i) => (
            <div key={i} style={{ color: i === step.codeLine ? 'var(--accent-soft)' : 'var(--fg-subtle)', background: i === step.codeLine ? 'var(--primary-subtle)' : 'transparent', borderRadius: 4, padding: '0 6px', transition: 'background .2s ease' }}>{line}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
