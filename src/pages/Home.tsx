import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DSection, EmptyNote, HBar, StatMetric } from '../components/dashboard/blocks';
import { BarBucket, ChartFrame, HeatDay, LearningHeatmap, StackedBarChart } from '../components/dashboard/charts';
import { Icon } from '../components/common/Icon';
import { listVisualizations } from '../components/visualization/registry';
import { levels, worlds } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import { getSession } from '../services/authService';
import { getSettings } from '../services/contentStore';
import { getTopicCompletion, hasMasteryHistory } from '../services/masteryService';
import { getLevel, getLessonProgress, getLevelProgress, getNextLesson, getRevisionDue, getWorld, isLevelCompleted, isLevelUnlocked, publishedLessons } from '../services/progressService';
import { getCodingStats, getTopicMastery } from '../services/statsService';
import { todayKey } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';
import { DayActivity, Difficulty, Level } from '../types';
import '../styles/dashboard.css';

type Range = '7D' | '30D' | '90D' | '1Y';
const RANGE_DAYS: Record<Range, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 364 };

function buildBuckets(activity: Record<string, DayActivity>, lessonDates: Record<string, string>, range: Range): BarBucket[] {
  const per = range === '90D' ? 7 : range === '1Y' ? 28 : 1;
  const count = Math.round(RANGE_DAYS[range] / per);
  const out: BarBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    let lessonsN = 0, practiceN = 0;
    const end = new Date(); end.setDate(end.getDate() - i * per);
    for (let d = 0; d < per; d++) {
      const dt = new Date(end); dt.setDate(dt.getDate() - d);
      const k = todayKey(dt);
      if (lessonDates[k]) lessonsN += 1;
      practiceN += activity[k]?.problemsSolved ?? 0;
    }
    out.push({
      label: end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      segments: [
        { name: 'Lessons', value: lessonsN, color: 'var(--d-green)' },
        { name: 'Practice', value: practiceN, color: 'var(--d-blue)' },
      ],
    });
  }
  return out;
}

export default function Home() {
  const { stats, syncState, retrySync } = usePlayer();
  const [range, setRange] = useState<Range>('7D');
  const [selDay, setSelDay] = useState<HeatDay | null>(null);
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
  const completion = useMemo(() => getTopicCompletion(stats).slice(0, 6), [stats]);
  const coding = getCodingStats(stats);

  const buckets = useMemo(() => buildBuckets(stats.activity, stats.lessonCompletedAt, range), [stats.activity, stats.lessonCompletedAt, range]);
  const rangeEvents = buckets.reduce((s, b) => s + b.segments.reduce((x, y) => x + y.value, 0), 0);
  const rangeMinutes = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < RANGE_DAYS[range]; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); sum += stats.activity[todayKey(dt)]?.minutes ?? 0; }
    return sum;
  }, [stats.activity, range]);
  const activityStatus = syncState === 'loading' ? 'loading' : syncState === 'error' && rangeEvents === 0 ? 'error' : rangeEvents === 0 ? 'empty' : 'success';

  const heatDays = useMemo(() => {
    const out: HeatDay[] = [];
    for (let i = 111; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); const k = todayKey(dt); out.push({ date: k, value: stats.activity[k]?.count ?? 0 }); }
    return out;
  }, [stats.activity]);
  const heatTotal = heatDays.reduce((s, d) => s + d.value, 0);

  const attemptedProblems = Object.values(stats.problems);
  const avgAttempts = attemptedProblems.length ? (coding.submissions / attemptedProblems.length).toFixed(1) : '—';
  const solvedThisWeek = useMemo(() => {
    let n = 0;
    for (const r of attemptedProblems) if (r.solvedDate && Date.now() - new Date(r.solvedDate).getTime() < 7 * 86400000) n += 1;
    return n;
  }, [attemptedProblems]);

  const trend = useMemo(() => {
    const weeks: { label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      let sum = 0;
      for (const r of attemptedProblems) {
        if (!r.solvedDate) continue;
        const d = Math.floor((Date.now() - new Date(r.solvedDate).getTime()) / 86400000);
        if (d >= i * 7 && d < (i + 1) * 7) sum += 1;
      }
      weeks.push({ label: `W${12 - i}`, value: sum });
    }
    return weeks;
  }, [attemptedProblems]);
  const trendTotal = trend.reduce((s, w) => s + w.value, 0);
  const trendDir = useMemo(() => {
    if (trendTotal < 3) return null;
    const half = Math.floor(trend.length / 2);
    const a = trend.slice(0, half).reduce((s, w) => s + w.value, 0);
    const b = trend.slice(half).reduce((s, w) => s + w.value, 0);
    if (b > a + 1) return 'up' as const;
    if (b < a - 1) return 'down' as const;
    return 'flat' as const;
  }, [trend, trendTotal]);

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
  const levelsCompleted = levels.filter(l => isLevelCompleted(stats, l)).length;
  const overallPct = Math.round((levelsCompleted / levels.length) * 100);

  const diffDist = (['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => {
    const all = problems.filter(p => p.difficulty === d);
    const att = all.filter(p => stats.problems[p.id]).length;
    const solved = all.filter(p => stats.problems[p.id]?.solved).length;
    return { d, att, solved, pct: all.length ? (solved / all.length) * 100 : 0 };
  });
  const pubProjects = projects.filter(p => p.status === 'PUBLISHED');
  const viz = listVisualizations();

  return (
    <div className="dash">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div className="dsec" style={{ marginBottom: 6 }}>PIXEL // LEARNING ANALYTICS</div>
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

        <DSection className="dc-journey" title={`CURRICULUM · LEVEL ${next ? level?.number : levelsCompleted} / ${levels.length} · WORLD ${world?.number ?? worlds.length} / ${worlds.length}`} action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/learn">Curriculum →</Link>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            <StatMetric label="COMPLETED" value={levelsCompleted} unit="levels" />
            <StatMetric label="CURRENT" value={next ? level?.number ?? 0 : levelsCompleted} unit={`L`} />
            <StatMetric label="WORLD" value={world?.number ?? worlds.length} unit={`/ ${worlds.length}`} />
            <StatMetric label="OVERALL" value={overallPct} unit="%" tone={overallPct > 0 ? 'var(--d-green)' : undefined} />
          </div>
          {worlds.map(w => {
            const wl = levels.filter(l => l.worldId === w.id).sort((a, b) => a.number - b.number);
            const done = wl.filter(l => isLevelCompleted(stats, l)).length;
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
                <span className="mono t-caption" style={{ color: 'var(--d-fg2)', textAlign: 'right' }}>{Math.round((done / wl.length) * 100)}%</span>
              </div>
            );
          })}
        </DSection>

        <DSection className="dc-mastery" title="MASTERY vs COMPLETION">
          {mastery.length === 0 ? <EmptyNote>Not enough data yet. Mastery is computed from completed lessons, correct checks and solved problems.</EmptyNote> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mastery.map(t => {
                const c = completion.find(x => x.topic === t.topic);
                return <HBar key={t.topic} label={t.topic} value={t.pct} tone={t.pct >= 70 ? 'var(--d-green)' : t.pct >= 40 ? 'var(--d-blue)' : 'var(--d-orange)'} caption={`completion ${c?.pct ?? 0}%`} />;
              })}
              {!hasMasteryHistory() && <p className="t-caption" style={{ color: 'var(--d-muted)' }}>Mastery history not recorded yet — trend deltas appear once snapshots exist.</p>}
            </div>
          )}
        </DSection>

        <DSection className="dc-activity" title="ACTIVITY" action={
          <div className="drange">{(['7D', '30D', '90D', '1Y'] as Range[]).map(r => <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)} aria-pressed={range === r}>{r}</button>)}</div>
        }>
          <ChartFrame status={activityStatus} emptyMessage="No activity in this range yet. Lessons and practice you complete will populate this chart." onRetry={retrySync} minHeight={140}>
            <StackedBarChart buckets={buckets} height={120} ariaLabel={`Learning activity per ${range === '7D' ? 'day' : 'period'}, ${range}`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              <StatMetric label="EVENTS" value={rangeEvents} sub={range} />
              <StatMetric label="MINUTES" value={rangeMinutes} sub={range} />
              <StatMetric label="STREAK" value={stats.streak} unit="days" trendDir={stats.streak > 0 ? 'up' : 'flat'} trend={stats.streak > 0 ? 'active' : 'idle'} />
            </div>
          </ChartFrame>
        </DSection>

        <DSection className="dc-practice" title="PRACTICE ANALYTICS" action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/practice">Tracker →</Link>}>
          {coding.submissions === 0 ? <EmptyNote>No practice data yet. Attempt problems in the tracker to unlock success-rate and trend analytics.</EmptyNote> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
                <StatMetric label="SOLVED" value={coding.solved} trend={solvedThisWeek > 0 ? `+${solvedThisWeek} this week` : undefined} trendDir={solvedThisWeek > 0 ? 'up' : 'flat'} />
                <StatMetric label="ATTEMPTED" value={coding.submissions} sub={`${attemptedProblems.length} problems`} />
                <StatMetric label="SUCCESS RATE" value={coding.acceptance} unit="%" tone={coding.acceptance >= 70 ? 'var(--d-green)' : 'var(--d-orange)'} />
                <StatMetric label="AVG ATTEMPTS" value={Number(avgAttempts) || 0} unit="per problem" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {diffDist.map(d => <HBar key={d.d} label={d.d} value={d.pct} tone={d.d === 'EASY' ? 'var(--d-green)' : d.d === 'MEDIUM' ? 'var(--d-blue)' : 'var(--d-orange)'} caption={`attempted ${d.att} · solved ${d.solved}`} />)}
              </div>
              {trendTotal >= 3 && (
                <div style={{ marginTop: 14 }}>
                  <div className="dsec" style={{ marginBottom: 8 }}>SOLVED PER WEEK {trendDir ? `· ${trendDir === 'up' ? 'IMPROVING' : trendDir === 'down' ? 'DECLINING' : 'STABLE'}` : ''}</div>
                  <StackedBarChart buckets={trend.map(w => ({ label: w.label, segments: [{ name: 'Solved', value: w.value, color: 'var(--d-green)' }] }))} height={72} ariaLabel="Problems solved per week" />
                </div>
              )}
            </>
          )}
        </DSection>

        <DSection className="dc-heat" title="LEARNING HEATMAP · 16 WEEKS">
          <ChartFrame status={syncState === 'loading' ? 'loading' : heatTotal === 0 ? 'empty' : 'success'} emptyMessage="No learning history yet. Every lesson, practice session and visualization you complete adds real activity here." onRetry={retrySync} minHeight={120}>
            <LearningHeatmap days={heatDays} selected={selDay?.date ?? null} onSelect={setSelDay} />
            {selDay && <p className="t-caption" style={{ color: 'var(--d-fg2)', marginTop: 8 }}><span className="mono" style={{ color: 'var(--d-fg)' }}>{selDay.date}</span> — {selDay.value} {selDay.value === 1 ? 'activity' : 'activities'}</p>}
          </ChartFrame>
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

        <DSection className="dc-projects" title="PROJECTS">
          {pubProjects.length === 0 ? <EmptyNote>No projects published yet.</EmptyNote> : pubProjects.map(p => {
            const doneP = stats.completedProjects.includes(p.id);
            const relLevel = levels.find(l => l.id === p.levelId);
            return (
              <div key={p.id} className="drow" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{p.title}</div>
                  <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 2 }}>
                    {relLevel ? `Level ${relLevel.number} · ` : ''}{p.difficulty.toLowerCase()} · next: {p.requirements[0] ?? '—'}
                  </div>
                </div>
                <span className={`chip ${doneP ? 'chip-success' : 'chip-info'}`}>{doneP ? 'DONE' : `+${p.xp} XP`}</span>
              </div>
            );
          })}
        </DSection>

        <DSection className="dc-viz" title="VISUALIZATION PROGRESS" action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/explore">Lab →</Link>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 10 }}>
            <StatMetric label="COMPLETED" value={stats.completedVisualizations.length} unit={`/ ${viz.length}`} />
            <StatMetric label="AVAILABLE" value={viz.length} unit="engines" />
          </div>
          {viz.map(v => (
            <div key={v.id} className="drow">
              <div style={{ minWidth: 0 }}>
                <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{v.title}
