import { useMemo } from 'react';
import { selectAnalyticsBandUnits } from '../../dashboard/bandSelectors';
import { selectPracticeOverview } from '../../dashboard/practiceSelectors';
import { usePlayer } from '../../store/PlayerContext';
import { ProvenanceChip } from '../ui/primitives';
import { Sparkline } from './Sparkline';

const R = 34;
const C = 2 * Math.PI * R;

export function AccuracyRing() {
  const { stats } = usePlayer();
  const o = useMemo(() => selectPracticeOverview(stats), [stats]);
  const accUnit = useMemo(() => selectAnalyticsBandUnits(stats).find(u => u.key === 'accuracy'), [stats]);
  const acc = o.overallAccuracy;
  const rows: [string, string][] = [
    ['Total attempts', `${o.attempts}`],
    ['Correct', `${o.solved}`],
    ['Incorrect', `${Math.max(0, o.attempts - o.solved)}`],
    ['Avg solve time', o.avgSolveSeconds === null ? '—' : `${Math.floor(o.avgSolveSeconds / 60)}m ${o.avgSolveSeconds % 60}s`],
  ];
  return (
    <section className="ui-panel" aria-label="Practice performance">
      <div className="ui-panel-head"><div className="ui-index">Practice Performance</div><ProvenanceChip kind="observed" /></div>
      {o.attempts === 0 ? (
        <div className="dempty">No practice attempts yet.</div>
      ) : (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`Overall practice accuracy ${acc ?? 0} percent`}>
            <circle cx="46" cy="46" r={R} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
            <circle cx="46" cy="46" r={R} fill="none"
              stroke={acc !== null && acc >= 80 ? 'var(--success)' : acc !== null && acc >= 60 ? 'var(--action)' : 'var(--danger)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${((acc ?? 0) / 100) * C} ${C}`} transform="rotate(-90 46 46)" />
            <text x="46" y="51" textAnchor="middle" className="ui-ring-label">{acc ?? 0}%</text>
          </svg>
          <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rows.map(([l, v]) => (
              <div key={l} className="v3-statrow"><span className="ui-mono">{l}</span><span className="ui-mono" style={{ color: 'var(--text-primary)' }}>{v}</span></div>
            ))}
            {accUnit?.comparison && <div className="ui-mono ui-muted">{accUnit.comparison}</div>}
            {accUnit && accUnit.series.length > 0 && <Sparkline values={accUnit.series} label="Solves per week" />}
          </div>
        </div>
      )}
    </section>
  );
}
