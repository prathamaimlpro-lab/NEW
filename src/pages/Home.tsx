import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DSection, EmptyNote, HBar, Metric } from '../components/dashboard/blocks';
import { Icon } from '../components/common/Icon';
import { listVisualizations } from '../components/visualization/registry';
import { levels, worlds } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import { getSession } from '../services/authService';
import { getSettings } from '../services/contentStore';
import { getLevel, getLessonProgress, getLevelProgress, getNextLesson, getRevisionDue, getWorld, isLevelCompleted, isLevelUnlocked, publishedLessons } from '../services/progressService';
import { getCodingStats, getTopicMastery } from '../services/statsService';
import { todayKey } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';
import { DayActivity, Difficulty, Level } from '../types';
import '../styles/dashboard.css';

type Range = '7D' | '30D' | '90D' | '1Y';
const RANGE_DAYS: Record<Range, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 364 };

function buckets(activity: Record<string, DayActivity>, range: Range): { label: string; value: number }[] {
  const per = range === '90D' ? 7 : range === '1Y' ? 28 : 1;
  const count = Math.round(RANGE_DAYS[range] / per);
  const out: { label: string; value: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    let sum = 0;
    const end = new Date(); end.setDate(end.getDate() - i * per);
    for (let d = 0; d < per; d++) { const dt = new Date(end); dt.setDate(dt.getDate() - d); sum += activity[todayKey(dt)]?.count ?? 0; }
    out.push({ label: end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), value: sum });
  }
  return out;
}

export default function Home() {
  const { stats } = usePlayer();
  const [range, setRange] = useState<Range>('7D');
  const session = getSession();
  const name = session?.email?.split('@')[0] ?? 'engineer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const next = getNextLesson(stats);
  const level = next ? getLevel(next.levelId) : undefined;
  const world = level ? getWorld(level.worldId) : undefined;
  const levelList = level ? publishedLessons(level) : [];
  const idx = next ? levelList.findIndex(l => l.id === next.id) + 1 : 0;
  const prog = next ? getLessonProgress(stats, next) : 0;
  const goal = getSettings().dailyGoalMinutes;
  const todayMin = stats.activity[todayKey()]?.minutes ?? 0;

  const mastery = useMemo(() => getTopicMastery(stats).filter(t => t.activity > 0).slice(0, 6), [stats]);
  const coding = getCodingStats(stats);
  const chart = useMemo(() => buckets(stats.activity, range), [stats.activity, range]);
  const chartMax = Math.max(1, ...chart.map(c => c.value));
  const rangeEvents = chart.reduce((s, c) => s + c.value, 0);
  const rangeMinutes = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < RANGE_DAYS[range]; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); sum += stats.activity[todayKey(dt)]?.minutes ?? 0; }
    return sum;
  }, [stats.activity, range]);
  const activeDays = useMemo(() => Object.values(stats.activity).filter(a => a.count > 0).length, [stats.activity]);

  const timeline = useMemo(() => {
    const ev: { date: string; kind: string; title: string }[] = [];
    for (const [id, date] of Object.entries(stats.lessonCompletedAt)) ev.push({ date, kind: 'Lesson completed', title: lessons[id]?.title ?? id });
    for (const [id, r] of Object.entries(stats.problems)) if (r.solved && r.solvedDate) ev.push({ date: r.solvedDate, kind: 'Problem solved', title: problems.find(p => p.id === id)?.title ?? id });
    return ev.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [stats]);

  const revision = getRevisionDue(stats)[0];
  const action = !next
    ? { label: 'Explore the curriculum', desc: 'All published lessons are complete.', to: '/learn' }
    : stats.completedLessons.length === 0
      ? { label: `Start Level ${level?.number}: ${next.title}`, desc: 'Your first lesson — beginner-friendly, no prerequisites.', to: `/learn/lesson/${next.id}` }
      : revision
        ? { label: `Revision due: ${revision.title}`, desc: 'Spaced revision keeps mastery stable.', to: revision.kind === 'lesson' ? `/learn/lesson/${revision.id}` : `/practice/problems/${revision.id}` }
        : (stats.activity[todayKey()]?.count ?? 0) === 0
          ? { label: "Complete today's practice", desc: 'No learning activity recorded today yet.', to: '/practice' }
          : { label: `Continue ${next.title}`, desc: `Lesson ${idx} of ${levelList.length} · ${prog}% complete.`, to: `/learn/lesson/${next.id}` };

  const levelState = (l: Level): 'completed' | 'current' | 'available' | 'locked' => {
    if (isLevelCompleted(stats, l)) return 'completed';
    if (!isLevelUnlocked(stats, l)) return 'locked';
    if (l.id === next?.levelId || getLevelProgress(stats, l) > 0) return 'current';
    return 'available';
  };

  const diffDist = (['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => {
    const all = problems.filter(p => p.difficulty === d);
    const solved = all.filter(p => stats.problems[p.id]?.solved).length;
    return { d, solved, total: all.length, pct: all.length ? (solved / all.length) * 100 : 0 };
  });
  const recentProblems = Object.entries(stats.problems).filter(([, r]) => r.lastAttempted).sort((a, b) => (b[1].lastAttempted ?? '').localeCompare(a[1].lastAttempted ?? '')).slice(0, 4);
  const pubProjects = projects.filter(p => p.status === 'PUBLISHED');
  const viz = listVisualizations();

  return (
    <div className="dash">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div className="dsec" style={{ marginBottom: 6 }}>PIXEL // LEARNING COMMAND CENTER</div>
          <h1 className="t-hlg">{greeting}, {name}</h1>
          <p className="t-body" style={{ color: 'var(--d-fg2)', marginTop: 6 }}>
            {world && level ? `${world.title} · Level ${level.number} · ${next?.title ?? 'journey complete'}` : 'Your engineering journey'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="chip chip-success"><Icon name="flame" size={12} /> {stats.streak}D STREAK</span>
          <span className="chip chip-info"><Icon name="bolt" size={12} /> {stats.xp.toLocaleString()} XP</span>
          <span className="chip">{todayMin}/{goal} MIN TODAY</span>
        </div>
      </div>

      <div className="dash-grid">
        <DSection className="dc-continue" title="CONTINUE LEARNING">
          {next && level ? (
            <div className="cont-grid">
              <div>
                <div className="dsec" style={{ color: 'var(--d-blue)', marginBottom: 8 }}>{world?.title.toUpperCase()} · LEVEL {level.number}</div>
                <h2 className="t-hmd" style={{ marginBottom: 6 }}>{next.title}</h2>
                <p className="t-caption" style={{ color: 'var(--d-muted)', marginBottom: 12 }}>Lesson {idx} of {levelList.length} · {next.estimatedMinutes} min · +{next.xpReward} XP</p>
                <div className="dtrack" style={{ height: 8 }}><div style={{ width: `${prog}%`, background: 'var(--d-blue)' }} /></div>
                <div className="t-caption mono" style={{ color: 'var(--d-fg2)', marginTop: 6 }}>{prog}% complete</div>
              </div>
              <Link className="dbtn-primary" to={`/learn/lesson/${next.id}`}>{stats.completedLessons.length === 0 ? 'Start Learning' : 'Continue Learning'}</Link>
            </div>
          ) : <EmptyNote>All published lessons are completed. New content is being authored.</EmptyNote>}
        </DSection>

        <DSection className="dc-next" title="NEXT BEST ACTION">
          <p className="t-body" style={{ color: 'var(--d-fg)', fontWeight: 500, marginBottom: 6 }}>{action.label}</p>
          <p className="t-caption" style={{ color: 'var(--d-muted)', marginBottom: 14 }}>{action.desc}</p>
          <Link className="btn btn-secondary" to={action.to}>Open</Link>
        </DSection>

        <DSection className="dc-journey" title={`LEARNING JOURNEY · ${worlds.length} WORLDS · ${levels.length} LEVELS`} action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/learn">Curriculum →</Link>}>
          {worlds.map(w => {
            const wl = levels.filter(l => l.worldId === w.id).sort((a, b) => a.number - b.number);
            return (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 44px', gap: 12, alignItems: 'center', padding: '8px 0', borderTop: '1px solid var(--d-border)' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="t-body-sm" style={{ color: 'var(--d-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.title}</div>
                  <div className="dsec">WORLD {w.number}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {wl.map(l => {
                    const st = levelState(l);
                    return <Link key={l.id} to={`/learn/level/${l.id}`} className={`pip pip-${st}`} title={`Level ${l.number}: ${l.title} (${st})`} aria-label={`Level ${l.number} ${st}`} />;
                  })}
                </div>
                <span className="mono t-caption" style={{ color: 'var(--d-fg2)', textAlign: 'right' }}>{getLevelProgress(stats, wl[0]) >= 0 ? Math.round(wl.filter(l => isLevelCompleted(stats, l)).length / wl.length * 100) : 0}%</span>
              </div>
            );
          })}
        </DSection>

        <DSection className="dc-mastery" title="TOPIC MASTERY">
          {mastery.length === 0 ? <EmptyNote>Not enough data yet. Complete lessons and practice to build mastery.</EmptyNote> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mastery.map(t => <HBar key={t.topic} label={t.topic} value={t.pct} tone={t.pct >= 70 ? 'var(--d-green)' : t.pct >= 40 ? 'var(--d-blue)' : 'var(--d-orange)'} />)}
            </div>
          )}
        </DSection>

        <DSection className="dc-activity" title="ACTIVITY" action={
          <div className="drange">{(['7D', '30D', '90D', '1Y'] as Range[]).map(r => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)} aria-pressed={range === r}>{r}</button>)}</div>
        }>
          {rangeEvents === 0 ? <EmptyNote>No activity in this range yet. Your real learning events will appear here.</EmptyNote> : (
            <>
              <div className="dchart" role="img" aria-label={`Activity chart for ${range}`}>
                {chart.map((c, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }} title={`${c.label}: ${c.value} events`}>
                    <div style={{ height: `${(c.value / chartMax) * 100}%`, minHeight: c.value > 0 ? 3 : 2, background: c.value > 0 ? 'var(--d-blue)' : 'var(--d-elevated)', borderRadius: 2 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
                <Metric label="EVENTS" value={String(rangeEvents)} sub={range} />
                <Metric label="MINUTES" value={String(rangeMinutes)} sub={range} />
                <Metric label="ACTIVE DAYS" value={String(activeDays)} sub="all time" />
              </div>
            </>
          )}
        </DSection>

        <DSection className="dc-practice" title="PRACTICE" action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/practice">Tracker →</Link>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            <Metric label="SOLVED" value={String(coding.solved)} />
            <Metric label="ATTEMPTED" value={String(coding.submissions)} />
            <Metric label="SUCCESS" value={`${coding.acceptance}%`} tone={coding.acceptance >= 70 ? 'var(--d-green)' : 'var(--d-orange)'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {diffDist.map(d => <HBar key={d.d} label={d.d} value={d.pct} tone={d.d === 'EASY' ? 'var(--d-green)' : d.d === 'MEDIUM' ? 'var(--d-blue)' : 'var(--d-orange)'} />)}
          </div>
          {recentProblems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {recentProblems.map(([id, r]) => (
                <div key={id} className="drow">
                  <span className="t-body-sm" style={{ color: 'var(--d-fg2)' }}>{problems.find(p => p.id === id)?.title ?? id}</span>
                  <span className={`chip ${r.solved ? 'chip-success' : 'chip-warning'}`}>{r.solved ? 'SOLVED' : 'ATTEMPTED'}</span>
                </div>
              ))}
            </div>
          )}
        </DSection>

        <DSection className="dc-projects" title="PROJECTS">
          {pubProjects.length === 0 ? <EmptyNote>No projects published yet.</EmptyNote> : pubProjects.map(p => (
            <div key={p.id} className="drow" style={{ alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{p.title}</div>
                <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 2 }}>Next: {p.requirements[0] ?? '—'}</div>
              </div>
              <span className={`chip ${stats.completedProjects.includes(p.id) ? 'chip-success' : 'chip-info'}`}>{stats.completedProjects.includes(p.id) ? 'DONE' : `+${p.xp} XP`}</span>
            </div>
          ))}
        </DSection>

        <DSection className="dc-viz" title="VISUALIZATIONS" action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/explore">Lab →</Link>}>
          {viz.map(v => (
            <div key={v.id} className="drow">
              <div style={{ minWidth: 0 }}>
                <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{v.title}</div>
                <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 2 }}>{v.category}</div>
              </div>
              <Link className="chip" to={`/explore/viz/${v.id}`}>{stats.completedVisualizations.includes(v.id) ? 'REOPEN' : 'OPEN'}</Link>
            </div>
          ))}
        </DSection>

        <DSection className="dc-timeline" title="ACTIVITY TIMELINE">
          {timeline.length === 0 ? <EmptyNote>No events yet. Complete a lesson or solve a problem to start your timeline.</EmptyNote> : timeline.map((e, i) => (
            <div key={i} className="drow" style={{ alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{e.title}</div>
                <div className="dsec" style={{ marginTop: 2 }}>{e.kind}</div>
              </div>
              <span className="mono t-caption" style={{ color: 'var(--d-muted)' }}>{e.date}</span>
            </div>
          ))}
        </DSection>
      </div>
    </div>
  );
}
