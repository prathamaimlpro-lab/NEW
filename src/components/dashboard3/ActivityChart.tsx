import { useMemo, useState } from 'react';
import { buildActivitySeries, type ActivityRange, type ActivitySeriesKey } from '../../dashboard/activitySeries';
import { SegmentedTabs } from '../ui/primitives';
import { usePlayer } from '../../store/PlayerContext';

const SERIES: { key: ActivitySeriesKey; label: string; color: string }[] = [
  { key: 'lessons', label: 'Lessons', color: 'var(--chart-1)' },
  { key: 'practice', label: 'Practice', color: 'var(--chart-2)' },
  { key: 'revision', label: 'Revision', color: 'var(--chart-3)' },
  { key: 'projects', label: 'Projects', color: 'var(--chart-4)' },
  { key: 'visualizations', label: 'Visualizations', color: 'var(--chart-5)' },
];

const RANGES: { value: ActivityRange; label: string }[] = [
  { value: '7D', label: '7D' }, { value: '30D', label: '30D' }, { value: '90D', label: '90D' }, { value: '1Y', label: '1Y' },
];

export function ActivityChart() {
  const { stats } = usePlayer();
  const [range, setRange] = useState<ActivityRange>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? '7D' : '30D',
  );
  const [hidden, setHidden] = useState<Set<ActivitySeriesKey>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  const { buckets, events, minutes } = useMemo(() => buildActivitySeries(stats, range), [stats, range]);
  const visible = SERIES.filter(s => !hidden.has(s.key));
  const max = Math.max(1, ...buckets.map(b => visible.reduce((s, v) => s + b[v.key], 0)));

  if (events === 0) {
    return (
      <section className="d3-chart" aria-label="Learning activity">
        <div className="d3-chart-head"><span className="d3-eyebrow">Learning Activity</span></div>
        <div className="dempty">No activity recorded yet. Lessons, practice, revision, projects and visualizations will appear here as you work.</div>
      </section>
    );
  }

  return (
    <section className="d3-chart" aria-label="Learning activity over time">
      <div className="d3-chart-head">
        <span className="d3-eyebrow">Learning Activity</span>
        <SegmentedTabs
          ariaLabel="Activity range"
          value={range}
          onChange={v => { setRange(v as ActivityRange); setHover(null); }}
          options={RANGES}
        />
      </div>

      <div className="d3-legend" role="group" aria-label="Toggle series">
        {SERIES.map(s => (
          <button key={s.key} type="button" className={`d3-legend-item ${hidden.has(s.key) ? 'off' : ''}`} aria-pressed={!hidden.has(s.key)}
            onClick={() => setHidden(prev => { const next = new Set(prev); if (next.has(s.key)) next.delete(s.key); else next.add(s.key); return next; })}>
            <span className="d3-legend-swatch" style={{ background: s.color }} aria-hidden="true" />{s.label}
          </button>
        ))}
      </div>

      <div className="d3-plot" style={{ position: 'relative' }}>
        {hover !== null && buckets[hover] && (
          <div className="d3-tip" role="status">
            <div className="d3-tip-title">{buckets[hover].label}</div>
            {visible.map(s => <div key={s.key} className="d3-tip-row"><span style={{ color: s.color }}>■</span> {s.label}: {buckets[hover][s.key]}</div>)}
            <div className="d3-tip-row">total {visible.reduce((s, v) => s + buckets[hover][v.key], 0)}</div>
          </div>
        )}
        <div className="bars" role="group" aria-label={`Stacked activity per bucket, ${range}`}>
          {buckets.map((b, i) => (
            <button key={i} type="button" className={`bcol ${hover === i ? 'on' : ''}`}
              onClick={() => setHover(hover === i ? null : i)}
              onFocus={() => setHover(i)} onBlur={() => setHover(h => (h === i ? null : h))}
              onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(i); }}
              onPointerLeave={e => { if (e.pointerType === 'mouse') setHover(h => (h === i ? null : h)); }}
              aria-label={`${b.label}: ${visible.map(v => `${v.label} ${b[v.key]}`).join(', ') || 'no visible series'}`}>
              {visible.map(v => (
                <div key={v.key} className="bseg" style={{ height: `${(b[v.key] / max) * 100}%`, background: v.color, minHeight: b[v.key] > 0 ? 2 : 0 }} />
              ))}
            </button>
          ))}
        </div>
        <div className="bxl" aria-hidden="true">
          {buckets.map((b, i) => <span key={i}>{b.showLabel ? b.label : ''}</span>)}
        </div>
      </div>
      <div className="d3-chart-foot">{events} events · {minutes} min in range</div>
    </section>
  );
}
