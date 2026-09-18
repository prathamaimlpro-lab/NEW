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

/* ---------------- Activity Analytics ---------------- */
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
        <span className="d-eyebrow">Learning Activity</span>
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
        <div className="dempty" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span>Couldn't load activity data.</span>
          <button className="cta-outline" onClick={retrySync}>Retry</button>
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
              <div className="d-micro" style={{ color: 'var(--text-primary, #F8FAFC)', marginBottom: 4 }}>{data.days[sel].label}</div>
              <div className="d-micro">{data.days[sel].lessons} lessons</div>
              <div className="d-micro">{data.days[sel].practice} practice</div>
              <div className="d-micro">{data.days[sel].revision} revision</div>
              <div className="d-micro">{data.days[sel].other} projects/viz</div>
            </div>
          )}
          <div className="bars" role="img" aria-label={`Stacked learning activity per period, ${range}`}>
            {data.days.map((d, i) => (
              <button key={d.date} type="button" className={`bcol ${sel === i ? 'on' : ''}`}
                onClick={() => setSel(sel === i ? null : i)}
                onFocus={() => setSel(i)} onBlur={() => setSel(s => (s === i ? null : s))}
                onPointerEnter={e => { if (e.pointerType === 'mouse') setSel(i); }}
                onPointerLeave={e => { if (e.pointerType === 'mouse') setSel(s => (s === i ? null : s)); }}
                aria-label={`${d.label}: ${d.total} activities`}>
                <div className="bseg" style={{ height: `${(d.other / max) * 100}%`, background: 'var(--text-secondary, #94A3B8)', minHeight: d.other > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.revision / max) * 100}%`, background: 'var(--signal-weak, #F59E0B)', minHeight: d.revision > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.practice / max) * 100}%`, background: 'var(--signal-mastered, #10B981)', minHeight: d.practice > 0 ? 2 : 0 }} />
                <div className="bseg" style={{ height: `${(d.lessons / max) * 100}%`, background: 'var(--signal-strong, #38BDFB)', minHeight: d.lessons > 0 ? 2 : 0 }} />
              </button>
            ))}
          </div>
          <div className="bxl" aria-hidden="true">
            {data.days.map((d, i) => <span key={i}>{d.showLabel ? d.label : ''}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }} className="d-micro">
        <span style={{ color: 'var(--signal-strong, #38BDFB)' }}>■ lessons</span>
        <span style={{ color: 'var(--signal-mastered, #10B981)' }}>■ practice</span>
        <span style={{ color: 'var(--signal-weak, #F59E0B)' }}>■ revision</span>
        <span style={{ color: 'var(--text-secondary, #94A3B8)' }}>■ projects/viz</span>
        <span style={{ color: 'var(--text-muted, #64748B)' }}>{data.events} events · {data.minutes} min in range</span>
      </div>
    </section>
  );
}

/* ---------------- Learning Heatmap ---------------- */
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

  return (
    <section className="p-chart">
      <div className="p-head"><span className="d-eyebrow">Learning Heatmap · 16 weeks</span></div>
      {status === 'loading' && <div className="skel" style={{ height: 120 }} aria-busy="true" />}
      {status === 'error' && <div className="dempty" style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>Couldn't load activity.</span><button className="cta-outline" onClick={retrySync}>Retry</button></div>}
      {status === 'empty' && <div className="dempty">Your learning activity will appear here. Every lesson, practice session and revision adds a cell to this map.</div>}
      {status === 'success' && (
        <>
          <div className="hm-wrap">
            <div className="hm-days" aria-hidden="true">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="hm-scroll">
              <div className="hm-grid">
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
            {[0, 1, 2, 3, 4].map(l => <span key={l} className={`hm-cell i${l}`} style={{ cursor: 'default', display: 'inline-block' }} />)}
            <span>More</span>
            {selDay && selDay.value > 0 && selDay.breakdown && (
              <span style={{ marginLeft: 'auto', color: 'var(--text-secondary, #94A3B8)' }}>
                {selDay.date} — {selDay.value} activities ({selDay.breakdown.lessons} lessons, {selDay.breakdown.problems} practice, {selDay.breakdown.other} other)
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------- Mastery vs Completion bridge ---------------- */
export function MasteryBridge() {
  const { stats } = usePlayer();
  const rows = useMemo(() => getMasteryRows(stats), [stats]);
  const [sortGap, setSortGap] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const overall = useMemo(() => getOverallCompletion(stats), [stats]);
  const avgMastery = rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  const shown = [...rows].sort((a, b) => (sortGap ? b.gap - a.gap : b.mastery - a.mastery)).slice(0, 7);
  const tier = (m: number) => (m >= 85 ? 'var(--signal-mastered, #10B981)' : m >= 60 ? 'var(--signal-strong, #38BDFB)' : m >= 35 ? 'var(--signal-developing, #94A3B8)' : 'var(--signal-weak, #F59E0B)');

  return (
    <section className="p-chart">
      <div className="p-head">
        <span className="d-eyebrow">Mastery vs Completion</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSortGap(v => !v)} aria-pressed={sortGap}>
            {sortGap ? 'sort: biggest gap' : 'sort: mastery'}
          </button>
          <Link className="d-micro" style={{ color: 'var(--signal-strong, #38BDFB)' }} to="/progress">Full analysis →</Link>
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
              <button type="button" onClick={() => setOpen(open === r.topic ? null : r.topic)}
                style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr) 44px', gap: 10, alignItems: 'center', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.topic}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ height: 3, borderRadius: 2, background: 'rgba(148,163,184,.35)', position: 'relative', display: 'block' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${r.completion}%`, background: 'rgba(148,163,184,.6)', borderRadius: 2, display: 'block' }} />
                  </span>
                  <span style={{ height: 6, borderRadius: 3, background: 'var(--surface-2, #181B22)', position: 'relative', display: 'block' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${r.mastery}%`, background: tier(r.mastery), borderRadius: 3, display: 'block', transition: 'width .42s cubic-bezier(.2,.72,.22,1)' }} />
                  </span>
                </span>
                <span className="d-micro" style={{ color: tier(r.mastery), textAlign: 'right' }}>{r.mastery}%</span>
              </button>
              {open === r.topic && (
                <div className="d-micro" style={{ marginTop: 6, marginLeft: 102, color: 'var(--text-secondary, #94A3B8)' }}>
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

/* ---------------- Curriculum Journey (world lanes) ---------------- */
export function CurriculumJourney() {
  const { stats } = usePlayer();
  const prog = useMemo(() => getCurriculumProgress(stats), [stats]);
  const [selLevel, setSelLevel] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const currentWorldId = levels.find(l => l.id === prog.currentLevelId)?.worldId ?? null;

  return (
    <section className="p-map">
      <div className="p-head">
        <span className="d-eyebrow">Curriculum Journey</span>
        <span className="d-micro">Completed {prog.levelsCompleted} levels · Current L{prog.currentLevelNumber} · Overall {prog.overallPct}%</span>
      </div>
      {prog.rows.map(row => {
        const wl = levels.filter(l => l.worldId === row.world.id);
        const isCollapsed = collapsed[row.world.id] && row.world.id !== currentWorldId;
        return (
          <div key={row.world.id} className="jl-row">
            <div className="jl-head">
              <span className="d-title">
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
                <div className="jpop">
                  <div>
                    <div className="d-title">Level {l.number}: {l.title}</div>
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

/* ---------------- Practice Analytics ---------------- */
export function PracticeAnalytics() {
  const { stats } = usePlayer();
  const matrix = useMemo(() => getAccuracyMatrix(stats), [stats]);
  const spark = useMemo(() => getSolvedSparkline(stats), [stats]);
  const attempted = Object.values(stats.problems).length;
  const solved = Object.values(stats.problems).filter(r => r.solved).length;
  const submissions = Object.values(stats.problems).reduce((s, r) => s + r.attempts, 0);
  const success = submissions > 0 ? Math.round((solved / submissions) * 100) : null;
  const sparkMax = Math.max(1, ...spark);
  const cellTone = (c?: { attempted: number; solved: number }) => {
    if (!c || c.attempted === 0) return undefined;
    const acc = (c.solved / c.attempted) * 100;
    if (acc >= 80) return 'rgba(16,185,129,.25)';
    if (acc >= 60) return 'rgba(56,189,251,.20)';
    if (acc >= 40) return 'rgba(245,158,11,.20)';
    return 'rgba(239,68,68,.18)';
  };

  return (
    <section className="p-chart">
      <div className="p-head">
        <span className="d-eyebrow">Practice Analytics</span>
        <Link className="d-micro" style={{ color: 'var(--signal-strong, #38BDFB)' }} to="/practice">Open tracker →</Link>
      </div>
      {submissions === 0 ? (
        <div className="dempty">Complete a few practice problems to see your accuracy patterns.</div>
      ) : (
        <>
          <div className="p-strip" style={{ border: '1px solid var(--border-subtle, #232732)', borderRadius: 6, marginBottom: 14 }}>
            <div><span className="d-big">{attempted}</span><span className="lbl">attempted</span></div>
            <div><span className="d-big">{solved}</span><span className="lbl">solved</span></div>
            <div>
              <span className="d-big">{success === null ? '—' : `${success}%`}</span><span className="lbl">success</span>
              <svg width="72" height="20" aria-label="Solved per day, last 7 days" style={{ marginLeft: 8 }}>
                <polyline fill="none" stroke="var(--signal-mastered, #10B981)" strokeWidth="1.5"
                  points={spark.map((v, i) => `${4 + i * 11},${18 - (v / sparkMax) * 14}`).join(' ')} />
              </svg>
            </div>
            <div><span className="d-big">{stats.streak}d</span><span className="lbl">streak</span></div>
          </div>
          <p className="d-micro" style={{ marginBottom: 10, color: 'var(--text-muted, #64748B)' }}>
            Practice accuracy reflects recent performance; mastery accounts for accuracy, recency, and how consistently a concept has been applied over time.
          </p>
          <div className="mx" style={{ gridTemplateColumns: '92px repeat(3, 1fr)' }}>
            <span />
            {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => <span key={d} className="mx-head">{d}</span>)}
            {matrix.topics.map(t => (
              <div key={t} style={{ display: 'contents' }}>
                <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                {(['EASY', 'MEDIUM', 'HARD'] as const).map(d => {
                  const c = matrix.cells[`${t}||${d}`];
                  return (
                    <span key={`${t}-${d}`} className="mx-cell" style={{ background: cellTone(c) ?? 'var(--surface-2, #181B22)' }}>
                      {c && c.attempted > 0 ? `${Math.round((c.solved / c.attempted) * 100)}%` : '—'}
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
