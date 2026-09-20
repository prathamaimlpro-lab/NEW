import { useMemo, useState } from 'react';
import { getHeatmapDays } from '../../services/activityService';
import { usePlayer } from '../../store/PlayerContext';

type Range = '30D' | '90D' | 'ALL';
const level = (v: number) => (v <= 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 9 ? 3 : 4);
const fmt = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export function Heatmap8() {
  const { stats } = usePlayer();
  const [range, setRange] = useState<Range>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? '90D' : 'ALL'));
  const [sel, setSel] = useState<string | null>(null);
  const [listView, setListView] = useState(false);

  const all = useMemo(() => getHeatmapDays(stats), [stats]);
  const days = useMemo(() => {
    const n = range === '30D' ? 30 : range === '90D' ? 90 : all.length;
    return all.slice(Math.max(0, all.length - n));
  }, [all, range]);
  const weeks = useMemo(() => {
    const out: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);
  const selDay = days.find(d => d.date === sel) ?? null;
  const total = days.reduce((s, d) => s + d.value, 0);

  const onKey = (e: React.KeyboardEvent) => {
    const cells = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button.hm8-cell'));
    const i = cells.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowRight') n = i + 1;
    if (e.key === 'ArrowLeft') n = i - 1;
    if (e.key === 'ArrowDown') n = i + 7;
    if (e.key === 'ArrowUp') n = i - 7;
    if (n >= 0 && n < cells.length) { e.preventDefault(); cells[n].focus(); }
  };

  return (
    <section className="d8-panel" aria-label="Learning heatmap">
      <div className="d3-chart-head">
        <span className="d3-eyebrow">Learning Heatmap</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="rtoggle" role="group" aria-label="Heatmap range">
            {(['30D', '90D', 'ALL'] as Range[]).map(r => (
              <button key={r} type="button" className={range === r ? 'on' : ''} aria-pressed={range === r} onClick={() => { setRange(r); setSel(null); }}>{r}</button>
            ))}
          </div>
          <button type="button" className="btn btn-sm btn-ghost" aria-pressed={listView} onClick={() => setListView(v => !v)}>
            {listView ? 'Grid view' : 'List view'}
          </button>
        </div>
      </div>

      {total === 0 && (
        <p className="d8-tip">No activity in this range yet — every day below is genuinely empty. Complete a lesson or practice question and the first cell fills in.</p>
      )}

      <div className="d8-tip" role="status">
        {selDay ? `${fmt(selDay.date)} — ${selDay.value} activities` : 'Hover or focus a day for exact activity.'}
      </div>

      {listView ? (
        days.filter(d => d.value > 0).length === 0 ? (
          <div className="dempty">No active days in this range yet.</div>
        ) : (
          <ul className="d8-list" role="list" aria-label="Active days">
            {days.filter(d => d.value > 0).slice().reverse().map(d => (
              <li key={d.date} className="d8-list-item">
                <span>{new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="d8-list-val">
                  {d.value} activities{d.breakdown ? ` (${d.breakdown.lessons} lessons · ${d.breakdown.problems} practice · ${d.breakdown.other} other)` : ''}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="d8-scroll">
          <div className="d8-grid" role="group" aria-label="Daily activity heatmap. Use arrow keys to move between days." onKeyDown={onKey}>
            {weeks.map((w, wi) => (
              <div key={wi} className="d8-col">
                {w.map(d => (
                  <button key={d.date} type="button"
                    className={`hm8-cell i${level(d.value)} ${sel === d.date ? 'sel' : ''}`}
                    title={`${d.date}: ${d.value} activities`}
                    onFocus={() => setSel(d.date)} onBlur={() => setSel(s => (s === d.date ? null : s))}
                    onPointerEnter={e => { if (e.pointerType === 'mouse') setSel(d.date); }}
                    onPointerLeave={e => { if (e.pointerType === 'mouse') setSel(s => (s === d.date ? null : s)); }}
                    onClick={() => setSel(sel === d.date ? null : d.date)}
                    aria-label={`${fmt(d.date)}: ${d.value} activities`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="d8-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(l => <span key={l} className={`hm8-cell i${l}`} aria-hidden="true" />)}
        <span>More</span>
        <span className="d8-total">{total} activities in range</span>
      </div>
    </section>
  );
}
