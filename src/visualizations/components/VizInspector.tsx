import { Chip, Progress } from '../../components/common/ui';
import { ArrayVizStep } from '../types';

const OPERATION: Record<ArrayVizStep['kind'], { label: string; tone: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  initial: { label: 'READY', tone: 'default' },
  compare: { label: 'COMPARING', tone: 'warning' },
  swap: { label: 'SWAPPING', tone: 'error' },
  'no-swap': { label: 'IN ORDER — NO SWAP', tone: 'success' },
  'pass-complete': { label: 'PASS COMPLETE', tone: 'primary' },
  sorted: { label: 'SORTED', tone: 'success' },
};

export function VizInspector({ step, index, total }: { step: ArrayVizStep; index: number; total: number }) {
  const pct = total > 1 ? Math.round((index / (total - 1)) * 100) : 100;
  const op = OPERATION[step.kind];
  const sortedCount = step.items.length - step.sortedFrom;
  return (
    <div className="vizlab-panel">
      <div className="vizlab-section">
        <div className="label-mono">PROGRESS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="t-body-sm">
          <span className="mono" style={{ color: 'var(--fg-primary)' }}>Step {index + 1} / {total}</span>
          <span className="mono" style={{ color: 'var(--fg-muted)' }}>{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      <div className="vizlab-section">
        <div className="label-mono">CURRENT OPERATION</div>
        <Chip tone={op.tone}>{op.label}</Chip>
        <p className="t-body-sm" style={{ color: 'var(--fg-secondary)' }}>{step.explanation}</p>
      </div>

      <div className="vizlab-section">
        <div className="label-mono">ALGORITHM METRICS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Comparisons</div><div className="mono t-body" style={{ color: 'var(--fg-primary)' }}>{step.comparisons}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Swaps</div><div className="mono t-body" style={{ color: 'var(--fg-primary)' }}>{step.swaps}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Current pass</div><div className="mono t-body" style={{ color: 'var(--fg-primary)' }}>{step.pass}</div></div>
          <div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>Sorted</div><div className="mono t-body" style={{ color: 'var(--fg-primary)' }}>{sortedCount} / {step.items.length}</div></div>
        </div>
      </div>

      <div className="vizlab-section">
        <div className="label-mono">ARRAY STATE</div>
        <p className="mono t-body-sm" style={{ color: 'var(--fg-secondary)', wordBreak: 'break-word' }}>{step.items.map(i => i.value).join(', ')}</p>
      </div>
    </div>
  );
}
