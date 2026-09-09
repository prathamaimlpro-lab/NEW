import { useEffect, useRef, useState } from 'react';

export type ChartStatus = 'loading' | 'error' | 'empty' | 'success';

export function ChartFrame({ status, emptyMessage, onRetry, children, minHeight = 120 }: {
  status: ChartStatus; emptyMessage: string; onRetry?: () => void; children: React.ReactNode; minHeight?: number;
}) {
  if (status === 'loading') return <div className="dskel" style={{ height: minHeight }} aria-busy="true" />;
  if (status === 'error') {
    return (
      <div className="dempty" style={{ minHeight }}>
        <p className="t-body-sm" style={{ color: 'var(--d-red)' }}>Couldn't load analytics data.</p>
        {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>}
      </div>
    );
  }
  if (status === 'empty') {
    return (
      <div className="dempty" style={{ minHeight }}>
        <p className="t-body-sm" style={{ color: 'var(--d-muted)' }}>{emptyMessage}</p>
      </div>
    );
  }
  return <>{children}</>;
}

export interface BarBucket { label: string; segments: { name: string; value: number; color: string }[] }

export function StackedBarChart({ buckets, height = 120, ariaLabel }: { buckets: BarBucket[]; height?: number; ariaLabel: string }) {
  const [sel, setSel] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setMounted(true), 30); return () => window.clearTimeout(t); }, []);
  const max = Math.max(1, ...buckets.map(b => b.segments.reduce((s, x) => s + x.value, 0)));
  const selected = sel !== null ? buckets[sel] : null;
  return (
    <div style={{ position: 'relative' }}>
      {selected && (
        <div className="dtooltip" role="status">
          <div className="dsec" style={{ marginBottom: 4 }}>{selected.label}</div>
          {selected.segments.map(s => (
            <div key={s.name} className="t-caption" style={{ color: 'var(--d-fg2)' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.color, marginRight: 6 }} />
              {s.name}: <span className="mono" style={{ color: 'var(--d-fg)' }}>{s.value}</span>
            </div>
          ))}
          <div className="t-caption mono" style={{ color: 'var(--d-fg)', marginTop: 4 }}>total {selected.segments.reduce((s, x) => s + x.value, 0)}</div>
        </div>
      )}
      <div className="dchart" style={{ height }} role="img" aria-label={ariaLabel}>
        {buckets.map((b, i) => {
          const total = b.segments.reduce((s, x) => s + x.value, 0);
          return (
            <button key={i} type="button" className={`dbar-col ${sel === i ? 'on' : ''}`} onClick={() => setSel(sel === i ? null : i)} aria-label={`${b.label}: ${total} activities`}>
              <div style={{ display: 'flex', flexDirection: 'column-reverse', height: '100%', width: '100%', gap: 1 }}>
                {b.segments.map(s => (
                  <div key={s.name} style={{ height: mounted ? `${(s.value / max) * 100}%` : '0%', minHeight: s.value > 0 ? 3 : 0, background: s.color, borderRadius: 2, transition: 'height .45s cubic-bezier(.32,.72,.28,1)' }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface HeatDay { date: string; value: number }

export function LearningHeatmap({ days, selected, onSelect }: { days: HeatDay[]; selected: string | null; onSelect: (d: HeatDay) => void }) {
  const weeks: HeatDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const level = (v: number) => (v <= 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : 3);
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '2px 0' }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {w.map(d => (
              <button key={d.date} type="button" className={`dheat dheat-${level(d.value)} ${selected === d.date ? 'sel' : ''}`} onClick={() => onSelect(d)} aria-label={`${d.date}: ${d.value} activities`} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }} className="t-caption">
        <span style={{ color: 'var(--d-muted)' }}>Less</span>
        {[0, 1, 2, 3].map(l => <span key={l} className={`dheat dheat-${l}`} style={{ cursor: 'default', display: 'inline-block' }} />)}
        <span style={{ color: 'var(--d-muted)' }}>More</span>
      </div>
    </div>
  );
}
