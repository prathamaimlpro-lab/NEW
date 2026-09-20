import { useMemo, useState } from 'react';
import { selectPracticeAnalytics } from '../../dashboard/selectors';
import { selectAccuracyTrend, selectPracticeOverview, selectStrongWeak, selectTopicRows, type AccuracyPoint } from '../../dashboard/practiceSelectors';
import { usePlayer } from '../../store/PlayerContext';

const tier = (acc: number) => (acc >= 80 ? 'd4-t-strong' : acc >= 60 ? 'd4-t-ok' : acc >= 40 ? 'd4-t-watch' : 'd4-t-weak');
const fmtTime = (s: number | null) => (s === null ? '—' : `${Math.floor(s / 60)}m ${s % 60}s`);

export function PracticeAnalytics4() {
  const { stats } = usePlayer();
  const matrixZone = useMemo(() => selectPracticeAnalytics(stats).matrix, [stats]);
  const overview = useMemo(() => selectPracticeOverview(stats), [stats]);
  const trend = useMemo(() => selectAccuracyTrend(stats), [stats]);
  const rows = useMemo(() => selectTopicRows(stats), [stats]);
  const { strong, weak } = useMemo(() => selectStrongWeak(stats), [stats]);
  const [hoverPt, setHoverPt] = useState<number | null>(null);

  const trendReady = trend.status === 'ready' && trend.data !== null;
  const pts: AccuracyPoint[] = trend.data ?? [];

  const metrics: [string, string, string][] = [
    ['Total attempts', `${overview.attempts}`, 'submissions recorded'],
    ['Solved', `${overview.solved}`, 'problems completed'],
    ['Overall accuracy', overview.overallAccuracy === null ? '—' : `${overview.overallAccuracy}%`, overview.attempts ? 'solved / attempts' : 'no submissions yet'],
    ['First-attempt', overview.firstAttempt.accuracy === null ? '—' : `${overview.firstAttempt.accuracy}%`, `n=${overview.firstAttempt.n}`],
    ['Retry', overview.retry.accuracy === null ? '—' : `${overview.retry.accuracy}%`, `n=${overview.retry.n}`],
    ['Avg solve time', fmtTime(overview.avgSolveSeconds), overview.avgSolveSeconds === null ? 'not captured' : 'solved problems'],
    ['Improvement', overview.firstAttempt.accuracy !== null && overview.retry.accuracy !== null ? `${overview.retry.accuracy - overview.firstAttempt.accuracy >= 0 ? '+' : ''}${overview.retry.accuracy - overview.firstAttempt.accuracy} pts` : '—', 'retry vs first'],
  ];

  return (
    <section className="d4-panel" aria-label="Practice analytics">
      <div className="d3-chart-head"><span className="d3-eyebrow">Practice Analytics</span></div>

      <div className="d4-metrics">
        {metrics.map(([label, value, note]) => (
          <div key={label} className="d4-metric">
            <div className="d3-eyebrow">{label}</div>
            <div className="d4-metric-value">{value}</div>
            <div className="d4-metric-note">{note}</div>
          </div>
        ))}
      </div>

      <div className="d4-section">
        <div className="d3-eyebrow" style={{ marginBottom: 8 }}>Difficulty × Topic accuracy</div>
        {matrixZone.status !== 'ready' || !matrixZone.data ? (
          <div className="dempty">
            {matrixZone.status === 'insufficient'
              ? matrixZone.reason
              : 'The accuracy matrix appears after at least 10 practice attempts across topics.'}
          </div>
        ) : (
          <>
            <div className="d4-matrix" role="table" aria-label="Accuracy by topic and difficulty">
              <div role="row" className="d4-mrow-head">
                <span role="columnheader">Topic</span>
                <span role="columnheader">Easy</span><span role="columnheader">Medium</span><span role="columnheader">Hard</span>
              </div>
              {rows.map(r => (
                <div key={r.topic} role="row" className="d4-mrow-grid">
                  <span role="rowheader" className="d4-mtopic">{r.topic}</span>
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => {
                    const c = r.byDifficulty[d];
                    const acc = c && c.attempted ? Math.round((c.solved / c.attempted) * 100) : null;
                    return (
                      <span key={d} role="cell" className={`d4-cell ${acc === null ? '' : tier(acc)}`}
                        aria-label={`${r.topic} ${d}: ${acc === null ? 'no attempts' : `${acc}% across ${c?.attempted} attempts`}`}>
                        {acc === null ? '—' : `${acc}%`}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="d4-list" role="list" aria-label="Accuracy by topic">
              {rows.map(r => (
                <div key={r.topic} role="listitem" className="d4-list-item">
                  <span className="d4-mtopic">{r.topic}</span>
                  <span className="d4-list-vals">
                    E {r.byDifficulty.EASY?.attempted ? Math.round((r.byDifficulty.EASY.solved / r.byDifficulty.EASY.attempted) * 100) : '—'}%
                    · M {r.byDifficulty.MEDIUM?.attempted ? Math.round((r.byDifficulty.MEDIUM.solved / r.byDifficulty.MEDIUM.attempted) * 100) : '—'}%
                    · H {r.byDifficulty.HARD?.attempted ? Math.round((r.byDifficulty.HARD.solved / r.byDifficulty.HARD.attempted) * 100) : '—'}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="d4-section">
        <div className="d3-eyebrow" style={{ marginBottom: 8 }}>Recent accuracy trend</div>
        {!trendReady ? (
          <div className="dempty">{trend.status === 'insufficient' ? trend.reason : 'Accuracy trend appears after 3 active practice periods.'}</div>
        ) : (
          <div className="d4-trend" style={{ position: 'relative' }}>
            {hoverPt !== null && pts[hoverPt] && (
              <div className="d3-tip" role="status">
                <div className="d3-tip-title">{pts[hoverPt].label}</div>
                <div className="d3-tip-row">accuracy {pts[hoverPt].accuracy}%</div>
                <div className="d3-tip-row">{pts[hoverPt].submissions} submissions</div>
              </div>
            )}
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="d4-trend-svg" role="img"
              aria-label={`Accuracy trend: ${pts.map(p => `${p.label} ${p.accuracy}%`).join(', ')}`}>
              <polyline fill="none" stroke="var(--action)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
                points={pts.map((p, i) => `${(i / Math.max(1, pts.length - 1)) * 96 + 2},${30 - (p.accuracy / 100) * 28}`).join(' ')} />
            </svg>
            <div className="d4-trend-pts">
              {pts.map((p, i) => (
                <button key={i} type="button" className="d4-pt"
                  onMouseEnter={() => setHoverPt(i)} onMouseLeave={() => setHoverPt(h => (h === i ? null : h))}
                  onFocus={() => setHoverPt(i)} onBlur={() => setHoverPt(h => (h === i ? null : h))}
                  aria-label={`${p.label}: ${p.accuracy}% accuracy over ${p.submissions} submissions`}>
                  <span className="d4-pt-dot" style={{ bottom: `${(p.accuracy / 100) * 100}%` }} aria-hidden="true" />
                  <span className="d4-pt-label">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="d4-section d4-sw">
        <div>
          <div className="d3-eyebrow" style={{ marginBottom: 8 }}>Strong areas</div>
          {strong.length === 0 ? <div className="d4-note">No topic has ≥3 attempts at ≥80% yet.</div> :
            strong.slice(0, 4).map(r => <div key={r.topic} className="d4-sw-row"><span>{r.topic}</span><span className="d4-sw-val">{r.accuracy}%</span></div>)}
        </div>
        <div>
          <div className="d3-eyebrow" style={{ marginBottom: 8 }}>Weak areas</div>
          {weak.length === 0 ? <div className="d4-note">No topic below 60% with ≥3 attempts.</div> :
            weak.slice(0, 4).map(r => <div key={r.topic} className="d4-sw-row"><span>{r.topic}</span><span className="d4-sw-val">{r.accuracy}%</span></div>)}
        </div>
      </div>
    </section>
  );
}
