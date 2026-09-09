import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { DSection, EmptyNote, HBar, Metric, StatMetric } from '../components/dashboard/blocks';
import { BarBucket, ChartFrame, HeatDay, LearningHeatmap, StackedBarChart } from '../components/dashboard/charts';
import { SkillMap } from '../components/dashboard/SkillMap';
import { listVisualizations } from '../components/visualization/registry';
import { levels, worlds } from '../data/curriculum';
import { projects } from '../data/projects';
import { getNextBestAction, getHeatmapDays, getPracticeAnalytics, getStrongConcepts, getWeakConcepts } from '../services/activityService';
import { getSession } from '../services/authService';
import { getSettings } from '../services/contentStore';
import { hasMasteryHistory } from '../services/masteryService';
import { getLevel, getLessonProgress, getLevelProgress, getNextLesson, getWorld, isLevelCompleted, isLevelUnlocked, publishedLessons } from '../services/progressService';
import { buildSkillGraph } from '../services/skillService';
import { getTopicMastery } from '../services/statsService';
import { todayKey } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';
import { DayActivity, Level } from '../types';
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
  const nba = useMemo(() => getNextBestAction(stats), [stats]);

  const mastery = useMemo(() => getTopicMastery(stats).filter(t => t.activity > 0).slice(0, 6), [stats]);
  const weak = useMemo(() => getWeakConcepts(stats), [stats]);
  const strong = useMemo(() => getStrongConcepts(stats), [stats]);
  const graph = useMemo(() => buildSkillGraph(stats), [stats]);
  const pa = useMemo(() => getPracticeAnalytics(stats), [stats]);

  const buckets = useMemo(() => buildBuckets(stats.activity, stats.lessonCompletedAt, range), [stats.activity, stats.lessonCompletedAt, range]);
  const rangeEvents = buckets.reduce((s, b) => s + b.segments.reduce((x, y) => x + y.value, 0), 0);
  const rangeMinutes = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < RANGE_DAYS[range]; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); sum += stats.activity[todayKey(dt)]?.minutes ?? 0; }
    return sum;
  }, [stats.activity, range]);
  const activityStatus = syncState === 'loading' ? 'loading' : syncState === 'error' && rangeEvents === 0 ? 'error' : rangeEvents === 0 ? 'empty' : 'success';

  const heatDays = useMemo(() => getHeatmapDays(stats), [stats]);
  const heatTotal = heatDays.reduce((s, d) => s + d.value, 0);

  const attemptedProblems = useMemo(() => Object.values(stats.problems), [stats.problems]);
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

  const levelState = (l: Level): 'completed' | 'current' | 'available' | 'locked' => {
    if (isLevelCompleted(stats, l)) return 'completed';
    if (!isLevelUnlocked(stats, l)) return 'locked';
    if (l.id === next?.levelId || getLevelProgress(stats, l) > 0) return 'current';
    return 'available';
  };
  const levelsCompleted = levels.filter(l => isLevelCompleted(stats, l)).length;
  const overallPct = Math.round((levelsCompleted / levels.length) * 100);
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
          <p className="t-body" style={{ color: 'var(--d-fg)', fontWeight: 500, marginBottom: 6 }}>{nba.label}</p>
          <p className="t-caption" style={{ color: 'var(--d-muted)', marginBottom: 14 }}>{nba.reason}</p>
          <Link className="btn btn-secondary" to={nba.to}>Open</Link>
        </DSection>

        <DSection className="dc-journey" title={`LEARNING JOURNEY · LEVEL ${next ? level?.number : levelsCompleted} / ${levels.length} · WORLD ${world?.number ?? worlds.length} / ${worlds.length}`} action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/learn">Curriculum →</Link>}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }} className="t-caption">
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}><span className="pip pip-completed" style={{ width: 10, height: 10 }} /> completed</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}><span className="pip pip-current" style={{ width: 10, height: 10 }} /> current</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}><span className="pip pip-available" style={{ width: 10, height: 10 }} /> available</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}><span className="pip pip-locked" style={{ width: 10, height: 10 }} /> locked</span>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}><span className="pip pip-milestone" style={{ width: 10, height: 10 }} /> milestone (every 10)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
            <StatMetric label="COMPLETED" value={levelsCompleted} unit="levels" />
            <StatMetric label="CURRENT" value={next ? level?.number ?? 0 : levelsCompleted} unit="L" />
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
                    return <Link key={l.id} to={`/learn/level/${l.id}`} className={`pip pip-${st} ${l.number % 10 === 0 ? 'pip-milestone' : ''}`} title={`Level ${l.number}: ${l.title} (${st})`} aria-label={`Level ${l.number} ${st}`} />;
                  })}
                </div>
                <span className="mono t-caption" style={{ color: 'var(--d-fg2)', textAlign: 'right' }}>{Math.round((done / wl.length) * 100)}%</span>
              </div>
            );
          })}
        </DSection>

        <DSection className="dc-mastery" title="MASTERY vs COMPLETION">
          {mastery.length === 0 ? <EmptyNote>Not enough data yet. Mastery is computed from completed lessons, correct checks and solved problems — separately from completion.</EmptyNote> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mastery.map(t => <HBar key={t.topic} label={t.topic} value={t.pct} tone={t.pct >= 75 ? 'var(--d-green)' : t.pct >= 50 ? 'var(--d-blue)' : 'var(--d-orange)'} />)}
              {!hasMasteryHistory() && <p className="t-caption" style={{ color: 'var(--d-muted)' }}>Mastery trend will appear as you build learning history.</p>}
            </div>
          )}
        </DSection>

        <DSection className="dc-skill" title="SKILL MAP · CONCEPT RELATIONSHIPS" action={<span className="t-caption" style={{ color: 'var(--d-muted)' }}>tap a concept</span>}>
          <SkillMap graph={graph} />
        </DSection>

        <DSection className="dc-insight" title="LEARNING INTELLIGENCE">
          {weak.length === 0 && strong.length === 0 ? (
            <EmptyNote>Insights build over time — complete lessons and practice problems to unlock personalized strength and weakness detection.</EmptyNote>
          ) : (
            <>
              <div className="dsec" style={{ marginBottom: 8 }}>NEEDS ATTENTION</div>
              {weak.length === 0 ? <p className="t-caption" style={{ color: 'var(--d-muted)' }}>No concepts currently flagged — detection requires at least 3 samples per topic.</p> : weak.map(w => (
                <div key={w.topic} className="dmetric" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="t-body-sm" style={{ color: 'var(--d-fg)', fontWeight: 600 }}>{w.topic}</span>
                    {w.accuracy !== null && <span className="mono t-caption" style={{ color: 'var(--d-orange)' }}>{w.accuracy}% acc</span>}
                  </div>
                  <ul style={{ listStyle: 'none', margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {w.reasons.slice(0, 2).map(r => <li key={r} className="t-caption" style={{ color: 'var(--d-muted)' }}>· {r}</li>)}
                  </ul>
                  <Link className="btn btn-ghost btn-sm" style={{ color: 'var(--d-blue)' }} to={w.recommended.to}>{w.recommended.label} →</Link>
                </div>
              ))}
              <div className="dsec" style={{ margin: '12px 0 8px' }}>STRONG AREAS</div>
              {strong.length === 0 ? <p className="t-caption" style={{ color: 'var(--d-muted)' }}>No strong areas detected yet.</p> : strong.map(s => (
                <div key={s.topic} className="drow">
                  <span className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{s.topic}</span>
                  <span className="mono t-caption" style={{ color: 'var(--d-green)' }}>{s.mastery !== null ? `${s.mastery}% mastery` : s.accuracy !== null ? `${s.accuracy}% acc` : ''}</span>
                </div>
              ))}
            </>
          )}
        </DSection>

        <DSection className="dc-activity" title="ACTIVITY" action={
          <div className="drange">{(['7D', '30D', '90D', '1Y'] as Range[]).map(r => <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)} aria-pressed={range === r}>{r}</button>)}</div>
        }>
          <ChartFrame status={activityStatus} emptyMessage="No activity in this range yet. Lessons and practice you complete will populate this chart." onRetry={retrySync} minHeight={140}>
            <StackedBarChart buckets={buckets} height={120} ariaLabel={`Learning activity per period, ${range}`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              <StatMetric label="EVENTS" value={rangeEvents} sub={range} />
              <StatMetric label="MINUTES" value={rangeMinutes} sub={range} />
              <StatMetric label="STREAK" value={stats.streak} unit="days" trendDir={stats.streak > 0 ? 'up' : 'flat'} trend={stats.streak > 0 ? 'active' : 'idle'} />
            </div>
          </ChartFrame>
        </DSection>

        <DSection className="dc-practice" title="PRACTICE ANALYTICS" action={<Link className="t-caption" style={{ color: 'var(--d-blue)' }} to="/practice">Tracker →</Link>}>
          {pa.submissions === 0 ? <EmptyNote>No practice data yet. Attempt problems in the tracker to unlock success-rate, difficulty and topic analytics.</EmptyNote> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                <StatMetric label="SOLVED" value={pa.solvedProblems} trend={solvedThisWeek > 0 ? `+${solvedThisWeek} this week` : undefined} trendDir={solvedThisWeek > 0 ? 'up' : 'flat'} />
                {pa.successRate === null
                  ? <Metric label="SUCCESS RATE" value="—" sub="no submissions yet" />
                  : <StatMetric label="SUCCESS RATE" value={pa.successRate} unit="%" tone={pa.successRate >= 70 ? 'var(--d-green)' : 'var(--d-orange)'} />}
                <Metric label="AVG ATTEMPTS" value={pa.avgAttempts === null ? '—' : pa.avgAttempts.toFixed(1)} sub="per problem" />
                <StatMetric label="FIRST-ATTEMPT" value={pa.firstAttemptSolves} sub={`of ${pa.solvedProblems} solves`} />
                <StatMetric label="REVIEW QUEUE" value={pa.reviewCount} />
                <StatMetric label="FAVOURITES" value={pa.favouriteCount} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pa.byDifficulty.filter(d => d.attempted > 0).map(d => (
                  <HBar key={d.d} label={d.d} value={d.accuracy ?? 0} tone={d.d === 'EASY' ? 'var(--d-green)' : d.d === 'MEDIUM' ? 'var(--d-blue)' : 'var(--d-orange)'} caption={`attempted ${d.attempted} · solved ${d.solved} · accuracy ${d.accuracy}%`} />
                ))}
              </div>
              {pa.byTopic.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div className="dsec" style={{ marginBottom: 8 }}>TOPIC PERFORMANCE</div>
                  {pa.byTopic.map(t => (
                    <div key={t.topic} className="drow">
                      <span className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{t.topic}</span>
                      <span className="mono t-caption" style={{ color: 'var(--d-fg2)' }}>{t.accuracy}% acc{t.mastery !== null ? ` · ${t.mastery}% mastery` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {trendTotal >= 3 && (
                <div style={{ marginTop: 14 }}>
                  <div className="dsec" style={{ marginBottom: 8 }}>SOLVED PER WEEK {trendDir ? `· ${trendDir === 'up' ? 'IMPROVING' : trendDir === 'down' ? 'DECLINING' : 'STABLE'}` : ''}</div>
                  <StackedBarChart buckets={trend.map(w => ({ label: w.label, segments: [{ name: 'Solved', value: w.value, color: 'var(--d-green)' }] }))} height={72} ariaLabel="Problems solved per week" />
                </div>
              )}
            </>
          )}
        </DSection>

        <DSection className="dc-heat" title="YOUR LEARNING ACTIVITY · 16 WEEKS">
          <ChartFrame status={syncState === 'loading' ? 'loading' : heatTotal === 0 ? 'empty' : 'success'} emptyMessage="Complete lessons, solve problems, and revise concepts to build your learning history." onRetry={retrySync} minHeight={120}>
            <LearningHeatmap days={heatDays} selected={selDay?.date ?? null} onSelect={setSelDay} />
            {selDay && selDay.value > 0 && selDay.breakdown && (
              <p className="t-caption" style={{ color: 'var(--d-fg2)', marginTop: 8 }}>
                <span className="mono" style={{ color: 'var(--d-fg)' }}>{selDay.date}</span> — {selDay.value} activities · {selDay.breakdown.lessons} lessons · {selDay.breakdown.problems} problems · {selDay.breakdown.other} other
              </p>
            )}
          </ChartFrame>
        </DSection>

        <DSection className="dc-timeline" title="ACTIVITY TIMELINE">
          <ActivityTimeline limit={12} />
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
                <div className="t-body-sm" style={{ color: 'var(--d-fg)' }}>{v.title}</div>
                <div className="t-caption" style={{ color: 'var(--d-muted)', marginTop: 2 }}>{v.category}</div>
              </div>
              <Link className="chip" to={`/explore/viz/${v.id}`}>{stats.completedVisualizations.includes(v.id) ? 'REOPEN' : 'OPEN'}</Link>
            </div>
          ))}
        </DSection>
      </div>
    </div>
  );
}
