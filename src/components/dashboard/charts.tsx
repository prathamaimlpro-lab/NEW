import { useEffect, useMemo, useState } from 'react';

export type ChartStatus = 'loading' | 'error' | 'empty' | 'success';

export function ChartFrame({
  status,
  emptyMessage,
  onRetry,
  children,
  minHeight = 120,
}: {
  status: ChartStatus;
  emptyMessage: string;
  onRetry?: () => void;
  children: React.ReactNode;
  minHeight?: number;
}) {
  if (status === 'loading') {
    return <div className="dskel" style={{ height: minHeight }} aria-busy="true" aria-label="Loading analytics" />;
  }

  if (status === 'error') {
    return (
      <div className="dempty" style={{ minHeight }}>
        <p className="t-body-sm" style={{ color: 'var(--d-red)' }}>Could not load analytics data.</p>
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

export interface BarBucket {
  label: string;
  segments: { name: string; value: number; color: string }[];
}

function bucketKey(buckets: BarBucket[]): string {
  return buckets.map(b => `${b.label}:${b.segments.map(s => `${s.name}-${s.value}`).join(',')}`).join('|');
}

export function StackedBarChart({
  buckets,
  height = 120,
  ariaLabel,
}: {
  buckets: BarBucket[];
  height?: number;
  ariaLabel: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const key = useMemo(() => bucketKey(buckets), [buckets]);

  useEffect(() => {
    setMounted(false);
    let frame = 0;
    frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, [key]);

  const max = Math.max(1, ...buckets.map(b => b.segments.reduce((sum, segment) => sum + segment.value, 0)));
  const selected = selectedIndex !== null ? buckets[selectedIndex] : null;

  return (
    <div style={{ position: 'relative' }}>
      {selected && (
        <div className="dtooltip" role="status">
          <div className="dsec" style={{ marginBottom: 4 }}>{selected.label}</div>
          {selected.segments.map(segment => (
            <div key={segment.name} className="t-caption" style={{ color: 'var(--d-fg2)' }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: segment.color,
                  marginRight: 6,
                }}
              />
              {segment.name}: <span className="mono" style={{ color: 'var(--d-fg)' }}>{segment.value}</span>
            </div>
          ))}
          <div className="t-caption mono" style={{ color: 'var(--d-fg)', marginTop: 4 }}>
            total {selected.segments.reduce((sum, segment) => sum + segment.value, 0)}
          </div>
        </div>
      )}

      <div className="dchart" style={{ height }} role="img" aria-label={ariaLabel}>
        {buckets.map((bucket, index) => {
          const total = bucket.segments.reduce((sum, segment) => sum + segment.value, 0);

          return (
            <button
              key={`${bucket.label}-${index}`}
              type="button"
              className={`dbar-col ${selectedIndex === index ? 'on' : ''}`}
              onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
              onPointerEnter={() => setSelectedIndex(index)}
              onPointerLeave={() => setSelectedIndex(current => (current === index ? null : current))}
              onFocus={() => setSelectedIndex(index)}
              aria-label={`${bucket.label}: ${total} activities`}
            >
              <div style={{ display: 'flex', flexDirection: 'column-reverse', height: '100%', width: '100%', gap: 1 }}>
                {bucket.segments.map(segment => (
                  <div
                    key={segment.name}
                    className="dbar-seg"
                    style={{
                      height: mounted ? `${(segment.value / max) * 100}%` : '0%',
                      minHeight: segment.value > 0 ? 3 : 0,
                      background: segment.color,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface HeatBreakdownInfo {
  lessons: number;
  problems: number;
  other: number;
}

export interface HeatDay {
  date: string;
  value: number;
  breakdown?: HeatBreakdownInfo;
}

export function LearningHeatmap({
  days,
  selected,
  onSelect,
}: {
  days: HeatDay[];
  selected: string | null;
  onSelect: (day: HeatDay) => void;
}) {
  const weeks: HeatDay[][] = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const level = (value: number) => {
    if (value <= 0) return 0;
    if (value <= 2) return 1;
    if (value <= 5) return 2;
    return 3;
  };

  const describe = (day: HeatDay) => {
    if (day.breakdown && day.value > 0) {
      return `${day.date}: ${day.value} learning activities, ${day.breakdown.lessons} lessons, ${day.breakdown.problems} problems, ${day.breakdown.other} other`;
    }
    return `${day.date}: ${day.value} learning activities`;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '2px 0' }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {week.map(day => (
              <button
                key={day.date}
                type="button"
                className={`dheat dheat-${level(day.value)} ${selected === day.date ? 'sel' : ''}`}
                onClick={() => onSelect(day)}
                aria-label={describe(day)}
                title={describe(day)}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }} className="t-caption">
        <span style={{ color: 'var(--d-muted)' }}>Less</span>
        {[0, 1, 2, 3].map(item => (
          <span
            key={item}
            className={`dheat dheat-${item}`}
            style={{ cursor: 'default', display: 'inline-block' }}
            aria-hidden="true"
          />
        ))}
        <span style={{ color: 'var(--d-muted)' }}>More</span>
      </div>
    </div>
  );
}
