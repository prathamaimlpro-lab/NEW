import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { levels } from '../../data/curriculum';
import {
  getAccuracyMatrix, getActivitySeries, getCurriculumProgress, getMasteryRows, getSolvedSparkline,
  journeyState, type Range,
} from '../../services/dashboardService';
import { getHeatmapDays } from '../../services/activityService';
import { getOverallCompletion, publishedLessons } from '../../services/progressService';
import { usePlayer } from '../../store/PlayerContext';

export function ActivityAnalytics() {
  const { stats, syncState, retrySync } = usePlayer();
  const [range, setRange] = useState<Range>('7D');
  const [sel, setSel] = useState<number | null>(null);
  const data = useMemo(() => getActivitySeries(stats, range), [stats, range]);
  const lifetime = useMemo(() => Object.values(stats.activity).reduce((s, a) => s + (a.count ?? 0), 0), [stats.activity]);
  const max = Math.max(1, ...data.days.map(d => d.total));
  const status = syncState === 'loading' ? 'loading' : syncState === 'error' && data.events === 0 ? 'error' : data.events === 0 ? 'empty' : 'success';

  return (
    <section className="p-chart">
      <div className="p-head">
        <h2 className="d-eyebrow" style={{ margin: 0 }}>Learning Activity</h2>
        <>
          <div className="rtoggle" role="group" aria-label="Activity range">
            {(['7D', '30D', '90D', '1Y'] as Range[]).map(r => (
              <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => { setRange(r); setSel(null); }} aria-pressed={range === r}>{r}</button>
            ))}
          </div>
          <select className="rselect" value={range} onChange={e => setRange(e.target.value as Range)} aria-label="Activity range">
            {(['7D', '30D', '90D', '1Y'] as Range[]).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </>
      </div>

      {status === 'loading' && (
        <div className="plot" style={{ height: 240 }} aria-busy="true">
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%' }}>
            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="skel" style={{ flex: 1, height: `${12 + ((i * 7) % 30)}%` }} />)}
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="state-error" role="alert">
          <span>Couldn't load activity data.</span>
          <button className="btn btn-secondary btn-sm" onClick={retrySync}>Retry</button>
        </div>
      )}
      {status === 'empty' && (
        <div className="dempty">
          {lifetime === 0
            ? 'No learning activity yet. Complete a lesson or solve a problem and your daily pattern will appear here.'
            : 'No activity in this range. Try a wider range to see earlier activity.'}
        </div>
      )}
      {status === 'success' && (
        <div className="plot" style={{ position: 'relative' }}>
          <div className="plot-grid" aria-hidden="true" />
          {sel !== null && data.days[sel] && (
            <div className="dtip" role="status">
              <div className="d-micro" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{data.days[sel].label}</div>
              <div className="d-micro">{data.days[sel].lessons} lessons</div>
              <div className="d-micro">{data.days[sel].practice} practice</div>
              <div className="d-micro">{data.days[sel].revision} revision</div>
              <div className="d-micro">{data.days[sel].other} projects/viz</div>
            </div>
          )}
          <div className="bars" role="group" aria-label={`Stacked learning activity per period, ${range}. Use Tab to reach individual day bars.`}>
            {data.days.map((d, i) => (
              <button key={d.date} type="button" className={`bcol ${sel === i ? 'on' : ''}`}
                onClick={() => setSel(sel === i ? null : i)}
                onFocus={() => setSel(i)} onBlur={() => setSel(s => (s === i ? null : s))}
                onPointerEnter={e => { if (e.pointerType === 'mouse') setSel(i); }}
                onPointerLeave={e => { if (e.pointerType === 'mouse') setSel(s => (s === i ? null : s)); }}
                aria-label={`${d.label}: ${d.total} activities (${d.lessons} lessons, ${d.practice} practice, ${d.revision} revision, ${d.other} projects or visualizations)`}>
                <div className="bseg" style={{ height: `${(d.other / max) * 100}%`, background: 'var(--text-secondary)', minHeight: d.other > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.revision / max) * 100}%`, background: 'var(--signal-weak)', minHeight: d.revision > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.practice / max) * 100}%`, background: 'var(--signal-mastered)', minHeight: d.practice > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.lessons / max) * 100}%`, background: 'var(--signal-strong)', minHeight: d.lessons > 0 ? 2 : 0 }} />
              </button>
            ))}
          </div>
          <div className="bxl" aria-hidden="true">
            {data.days.map((d, i) => <span key={i}>{d.showLabel ? d.label : ''}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }} className="d-micro">
        <span style={{ color: 'var(--signal-strong)' }}>■ lessons</span>
        <span style={{ color: 'var(--signal-mastered)' }}>■ practice</span>
        <span style={{ color: 'var(--signal-weak)' }}>■ revision</span>
        <span style={{ color: 'var(--text-secondary)' }}>■ projects/viz</span>
        <span style={{ color: 'var(--text-muted)' }}>{data.events} events · {data.minutes} min in range</span>
      </div>
    </section>
  );
}

export function HeatmapSection() {
  const { stats, syncState, retrySync } = usePlayer();
  const [sel, setSel] = useState<string | null>(null);
  const days = useMemo(() => getHeatmapDays(stats), [stats]);
  const total = days.reduce((s, d) => s + d.value, 0);
  const first = stats.firstActiveDate;
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const level = (v: number) => (v <= 0 ? 0 : v <= 2 ? 1 : v <= 5 ? 2 : v <= 9 ? 3 : 4);
  const status = syncState === 'loading' ? 'loading' : syncState === 'error' && total === 0 ? 'error' : total === 0 ? 'empty' : 'success';
  const selDay = days.find(d => d.date === sel) ?? null;

  const onHeatKey = (e: React.KeyboardEvent) => {
    const cells = Array.from((e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button.hm-cell'));
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
    <section className="p-chart">
      <div className="p-head"><h2 className="d-eyebrow" style={{ margin: 0 }}>Learning Heatmap · 16 weeks</h2></div>
      {status === 'loading' && <div className="skel" style={{ height: 120 }} aria-busy="true" />}
      {status === 'error' && (
        <div className="state-error" role="alert">
          <span>Couldn't load activity.</span>
          <button className="btn btn-secondary btn-sm" onClick={retrySync}>Retry</button>
        </div>
      )}
      {status === 'empty' && <div className="dempty">Your learning activity will appear here. Every lesson, practice session and revision adds a cell to this map.</div>}
      {status === 'success' && (
        <>
          <div className="hm-wrap">
            <div className="hm-days" aria-hidden="true">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="hm-scroll">
              <div className="hm-grid" role="group" aria-label="Learning activity heatmap. Use arrow keys to move between days." onKeyDown={onHeatKey}>
                {weeks.map((week, wi) => (
                  <div key={wi} className="hm-col">
                    {week.map(d => {
                      const pre = first ? d.date < first : false;
                      const wd = new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                      return (
                        <button key={d.date} type="button"
                          className={`hm-cell ${pre ? 'pre' : `i${level(d.value)}`} ${sel === d.date ? 'sel' : ''}`}
                          onClick={() => setSel(sel === d.date ? null : d.date)}
                          aria-label={`${wd} — ${d.value} activities`} title={`${wd} — ${d.value}`} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }} className="d-micro">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(l => <span key={l} className={`hm-cell i${l}`} style={{ cursor: 'default', display: 'inline-block' }} aria-hidden="true" />)}
            <span>More</span>
            {selDay && selDay.value > 0 && selDay.breakdown && (
              <span role="status" style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
                {selDay.date} — {selDay.value} activities ({selDay.breakdown.lessons} lessons, {selDay.breakdown.problems} practice, {selDay.breakdown.other} other)
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function MasteryBridge() {
  const { stats } = usePlayer();
  const rows = useMemo(() => getMasteryRows(stats), [stats]);
  const [sortGap, setSortGap] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const overall = useMemo(() => getOverallCompletion(stats), [stats]);
  const avgMastery = rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  const shown = [...rows].sort((a, b) => (sortGap ? b.gap - a.gap : b.mastery - a.mastery)).slice(0, 7);
  const tierClass = (m: number) => (m >= 85 ? 'tier-mastered' : m >= 60 ? 'tier-strong' : m >= 35 ? 'tier-developing' : 'tier-weak');

  return (
    <section className="p-chart">
      <div className="p-head">
        <h2 className="d-eyebrow" style={{ margin: 0 }}>Mastery vs Completion</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSortGap(v => !v)} aria-pressed={sortGap}>
            {sortGap ? 'sort: biggest gap' : 'sort: mastery'}
          </button>
          <Link className="d-micro" style={{ color: 'var(--accent-text)' }} to="/progress">Full analysis →</Link>
        </div>
      </div>
      {overall > 0 && avgMastery > 0 ? (
        <p className="d-body" style={{ marginBottom: 14 }}>You've completed {overall}% of the curriculum; your average mastery across attempted topics is {avgMastery}%.</p>
      ) : (
        <p className="d-body" style={{ marginBottom: 14 }}>Mastery data will appear as you complete lessons and practice concepts.</p>
      )}
      {rows.length === 0 ? (
        <div className="dempty">Mastery data will appear as you complete lessons and practice concepts.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map(r => (
            <div key={r.topic}>
              <button type="button" onClick={() => setOpen(open === r.topic ? null : r.topic)} aria-expanded={open === r.topic}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(96px, 140px) minmax(0,1fr) 44px', gap: 10, alignItems: 'center', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span className="d-body" style={{ color: 'var(--text-primary)', textAlign: 'left', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textWrap: 'balance' }}>{r.topic}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ height: 3, borderRadius: 2, background: 'rgba(217,201,178,.35)', position: 'relative', display: 'block' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${r.completion}%`, background: 'rgba(217,201,178,.6)', borderRadius: 2, display: 'block' }} />
                  </span>
                  <span style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', position: 'relative', display: 'block' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${r.mastery}%`, background: 'var(--signal-mastered)', borderRadius: 3, display: 'block', transition: 'width .42s cubic-bezier(.2,.72,.22,1)' }} />
                  </span>
                </span>
                <span className={`d-micro ${tierClass(r.mastery)}`} style={{ textAlign: 'right' }}>{r.mastery}%</span>
              </button>
              {open === r.topic && (
                <div className="d-micro" style={{ marginTop: 6, marginLeft: 102, color: 'var(--text-secondary)' }}>
                  completion {r.completion}% · practice accuracy {r.accuracy === null ? '—' : `${r.accuracy}%`} · {r.attempts} attempts
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function CurriculumJourney() {
  const { stats } = usePlayer();
  const prog = useMemo(() => getCurriculumProgress(stats), [stats]);
  const [selLevel, setSelLevel] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const currentWorldId = levels.find(l => l.id === prog.currentLevelId)?.worldId ?? null;

  return (
    <section className="p-map">
      <div className="p-head">
        <h2 className="d-eyebrow" style={{ margin: 0 }}>Curriculum Journey</h2>
        <span className="d-micro">Completed {prog.levelsCompleted} levels · Current L{prog.currentLevelNumber} · Overall {prog.overallPct}%</span>
      </div>
      {prog.rows.map(row => {
        const wl = levels.filter(l => l.worldId === row.world.id);
        const isCollapsed = collapsed[row.world.id] && row.world.id !== currentWorldId;
        return (
          <div key={row.world.id} className="jl-row">
            <div className="jl-head">
              <span className="d-title" style={{ minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textWrap: 'balance' }}>
                <button type="button" className="jl-toggle" onClick={() => setCollapsed(c => ({ ...c, [row.world.id]: !isCollapsed }))} aria-expanded={!isCollapsed}>
                  {isCollapsed ? '▸' : '▾'}
                </button>{' '}
                W{row.world.number} · {row.world.title}
              </span>
              <span className="d-micro">world progress: {row.pct}%</span>
            </div>
            <div className={`jl-lane ${isCollapsed ? 'collapsed' : ''}`}>
              {wl.map((l, i) => {
                const st = journeyState(stats, l.id, prog.currentLevelId);
                const prevDone = i > 0 && journeyState(stats, wl[i - 1].id, prog.currentLevelId) === 'done';
                return (
                  <span key={l.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {i > 0 && <span className={`jconn ${prevDone && st === 'done' ? 'jconn-done' : ''}`} aria-hidden="true" />}
                    <button type="button" className={`jnode jnode-${st}`} onClick={() => setSelLevel(selLevel === l.id ? null : l.id)}
                      aria-label={`Level ${l.number}: ${l.title} (${st})`}>
                      {l.number % 10 === 0 && <span className="dia" aria-hidden="true" />}
                      {st === 'done' ? '✓' : st === 'locked' ? '🔒' : l.number}
                    </button>
                  </span>
                );
              })}
            </div>
            {selLevel && wl.some(l => l.id === selLevel) && (() => {
              const l = wl.find(x => x.id === selLevel)!;
              const st = journeyState(stats, l.id, prog.currentLevelId);
              const firstLesson = publishedLessons(l)[0];
              return (
                <div className="jpop" role="status">
                  <div>
                    <div className="d-title" style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>Level {l.number}: {l.title}</div>
                    <div className="d-micro" style={{ marginTop: 4 }}>
                      {firstLesson ? `${firstLesson.title} · ${firstLesson.estimatedMinutes}m` : 'Lessons in authoring'}
                    </div>
                  </div>
                  {st === 'locked'
                    ? <span className="d-micro">Locked — requires Level {l.number - 1}</span>
                    : firstLesson && <Link className="cta-outline" to={`/learn/lesson/${firstLesson.id}`}>{st === 'done' ? 'Revisit' : st === 'current' ? 'Resume' : 'Start'}</Link>}
                </div>
              );
            })()}
          </div>
        );
      })}
    </section>
  );
}

export function PracticeAnalytics() {
  const { stats } = usePlayer();
  const matrix = useMemo(() => getAccuracyMatrix(stats), [stats]);
  const spark = useMemo(() => getSolvedSparkline(stats), [stats]);
  const attempted = Object.values(stats.problems).length;
  const solved = Object.values(stats.problems).filter(r => r.solved).length;
  const submissions = Object.values(stats.problems).reduce((s, r) => s + r.attempts, 0);
  const success = submissions > 0 ? Math.round((solved / submissions) * 100) : null;
  const sparkMax = Math.max(1, ...spark);
  const cellClass = (c?: { attempted: number; solved: number }) => {
    if (!c || c.attempted === 0) return 'mx-c-none';
    const acc = (c.solved / c.attempted) * 100;
    if (acc >= 80) return 'mx-c-high';
    if (acc >= 60) return 'mx-c-mid';
    if (acc >= 40) return 'mx-c-low';
    return 'mx-c-bad';
  };

  return (
    <section className="p-chart">
      <div className="p-head">
        <h2 className="d-eyebrow" style={{ margin: 0 }}>Practice Analytics</h2>
        <Link className="d-micro" style={{ color: 'var(--accent-text)' }} to="/practice">Open tracker →</Link>
      </div>
      {submissions === 0 ? (
        <div className="dempty">Complete a few practice problems to see your accuracy patterns.</div>
      ) : (
        <>
          <div className="p-strip" style={{ border: '1px solid var(--border-subtle)', borderRadius: 6, marginBottom: 14 }}>
            <div><span className="d-big">{attempted}</span><span className="lbl">attempted</span></div>
            <div><span className="d-big">{solved}</span><span className="lbl">solved</span></div>
            <div>
              <span className="d-big">{success === null ? '—' : `${success}%`}</span><span className="lbl">success</span>
              <svg width="72" height="20" aria-label={`Solved per day over the last 7 days: ${spark.join(', ')}`} role="img" style={{ marginLeft: 8 }}>
                <polyline fill="none" stroke="var(--signal-mastered)" strokeWidth="1.5"
                  points={spark.map((v, i) => `${4 + i * 11},${18 - (v / sparkMax) * 14}`).join(' ')} />
              </svg>
            </div>
            <div><span className="d-big">{stats.streak}d</span><span className="lbl">streak</span></div>
          </div>
          <p className="d-micro" style={{ marginBottom: 10, color: 'var(--text-muted)' }}>
            Practice accuracy reflects recent performance; mastery accounts for accuracy, recency, and how consistently a concept has been applied over time.
          </p>
          <div className="mx" style={{ gridTemplateColumns: 'minmax(96px, 140px) repeat(3, minmax(0,1fr))' }} role="table" aria-label="Accuracy by topic and difficulty">
            <div role="row" style={{ display: 'contents' }}>
              <span role="columnheader" className="mx-head" aria-label="Topic" />
              {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => <span key={d} role="columnheader" className="mx-head">{d}</span>)}
            </div>
            {matrix.topics.map(t => (
              <div key={t} role="row" style={{ display: 'contents' }}>
                <span role="rowheader" className="d-body" style={{ color: 'var(--text-primary)', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textWrap: 'balance' }}>{t}</span>
                {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => {
                  const c = matrix.cells[`${t}||${d}`];
                  const pct = c && c.attempted > 0 ? Math.round((c.solved / c.attempted) * 100) : null;
                  return (
                    <span key={`${t}-${d}`} role="cell" className={`mx-cell ${cellClass(c)}`}
                      aria-label={`${t}, ${d}: ${pct === null ? 'no attempts' : `${pct}% success across ${c?.attempted} attempts`}`}>
                      {pct === null ? '—' : `${pct}%`}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
