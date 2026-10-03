import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heatmap8 } from '../components/dashboard3/Heatmap8';
import '../components/dashboard3/dashboard3.css';
import '../components/dashboard3/heatmap8.css';
import '../components/dashboard3/home3.css';
import { useDashboardData } from '../dashboard/useDashboard';
import { useRealtimeRefresh } from '../dashboard/useRealtimeRefresh';
import { levels, worlds } from '../data/curriculum';
import { lessons as legacyLessons } from '../data/lessons';
import { getLesson } from '../services/contentService';
import { getLevelProgress } from '../services/progressService';
import { journeyState } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';

interface TodayItem { label: string; to: string; est?: string; done?: boolean }

export default function Home() {
  const d = useDashboardData();
  useRealtimeRefresh();
  const { stats } = usePlayer();

  const cont = d.continueLearning.data;
  const lessonMeta = cont ? getLesson(cont.lessonId) : undefined;
  const currentWorld = worlds.find(w => w.number === (cont?.worldNumber ?? 1)) ?? worlds[0];
  const currentLevel = levels.find(l => l.worldId === currentWorld.id && l.number === (cont?.levelNumber ?? 1));
  const worldLevels = levels.filter(l => l.worldId === currentWorld.id).slice(0, 10);
  const currentLevelId = d.journey.data?.currentLevelId ?? null;
  const levelProgress = currentLevel ? getLevelProgress(stats, currentLevel) : 0;

  const brandNew = (stats.events ?? []).length === 0 && stats.completedLessons.length === 0;
  const lastActivity = useMemo(() => {
    const keys = Object.keys(stats.activity).filter(k => (stats.activity[k]?.count ?? 0) > 0);
    const evs = (stats.events ?? []).map(e => e.at.slice(0, 10));
    const all = [...keys, ...evs].sort();
    return all.length ? all[all.length - 1] : null;
  }, [stats]);
  const daysSince = lastActivity ? Math.floor((Date.now() - new Date(`${lastActivity}T00:00:00`).getTime()) / 86400000) : null;
  const returning = !brandNew && daysSince !== null && daysSince >= 3;

  const greeting = brandNew ? 'Welcome to Pixel' : 'Welcome back';
  const support = brandNew
    ? `Start with World 1. Your first lesson takes about ${lessonMeta?.estimatedMinutes ?? 9} minutes.`
    : returning
      ? `It's been ${daysSince} days. Your next lesson is ready when you are.`
      : stats.streak > 0 ? `You're on a ${stats.streak}-day streak.` : 'Your next lesson is ready.';

  const todayKey = new Date().toISOString().slice(0, 10);
  const doneToday: TodayItem[] = (stats.events ?? [])
    .filter(e => e.at.slice(0, 10) === todayKey && e.kind === 'lesson_completed')
    .map(e => ({ label: `Finished ${e.title ?? e.id}`, to: '', done: true }));

  const tasks: TodayItem[] = [];
  if (cont && doneToday.length === 0) tasks.push({ label: `${cont.mode === 'resume' ? 'Continue' : 'Start'} ${cont.lessonTitle}`, est: lessonMeta ? `about ${lessonMeta.estimatedMinutes} min` : undefined, to: `/learn/lesson/${cont.lessonId}` });
  const revDue = d.revision.status === 'ready' && d.revision.data ? d.revision.data.due[0] : undefined;
  if (revDue) tasks.push({ label: `Revise ${revDue.title}`, est: 'due today', to: revDue.kind === 'lesson' ? `/learn/lesson/${revDue.id}` : `/practice/problems/${revDue.id}` });
  if (!brandNew) tasks.push({ label: 'Practice 5 questions', to: '/practice' });
  const today: TodayItem[] = [...doneToday, ...tasks.slice(0, Math.max(0, 3 - doneToday.length))];

  const topics = d.mastery.status === 'ready' && d.mastery.data
    ? [...d.mastery.data.rows].sort((a, b) => b.mastery - a.mastery).slice(0, 5)
    : [];

  const worldMastery = useMemo(() => {
    if (d.mastery.status !== 'ready' || !d.mastery.data) return 0;
    const worldTopics = new Set(Object.values(legacyLessons)
      .filter(l => levels.find(x => x.id === l.levelId)?.worldId === currentWorld.id)
      .flatMap(l => (l.topics ?? []) as string[]));
    const rows = d.mastery.data.rows.filter(r => worldTopics.has(r.topic));
    return rows.length ? Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length) : 0;
  }, [d.mastery, currentWorld.id]);

  const hasData = !brandNew;

  return (
    <div className="dash">
      <header className="ui-statement">
        <h1 className="ui-h1">{greeting}</h1>
        <p className="ui-desc">{support}</p>
      </header>

      {cont && (
        <section className="hm-hero" aria-label="Up next">
          <div className="hm-hero-grid">
            <div>
              <div className="ui-index">{cont.mode === 'begin' ? 'Up next' : 'Continue'} · World {cont.worldNumber} · {currentWorld.title}</div>
              <div className="hm-hero-title" style={{ fontSize: 22 }}>{cont.lessonTitle}</div>
              <div className="hm-hero-meta">
                Level {cont.levelNumber} of {worldLevels.length} · {cont.lessonCount} lessons
                {lessonMeta ? ` · about ${lessonMeta.estimatedMinutes} min · +${cont.xp} XP` : ''}
              </div>
              <div className="hm-dots" role="list" aria-label={`Levels in World ${currentWorld.number}`} style={{ marginTop: 10 }}>
                {worldLevels.map(l => {
                  const st = journeyState(stats, l.id, currentLevelId);
                  const dotClass = st === 'done' ? 'done' : st === 'current' ? 'current' : st === 'locked' ? 'locked' : '';
                  return (
                    <Link key={l.id} role="listitem" className={`hm-dot ${dotClass}`} to={`/learn/level/${l.id}`} aria-label={`Level ${l.number}, ${st}`}>{l.number}</Link>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={cont.levelProgress ?? 0} aria-label="Level progress">
                <div style={{ width: `${cont.levelProgress ?? 0}%` }} />
              </div>
              <div className="ui-mono">{cont.levelProgress ?? 0}% of this level</div>
              <Link className="btn btn-primary hm-cta" to={`/learn/lesson/${cont.lessonId}`}>
                {returning ? 'Pick up where you left off' : cont.mode === 'resume' ? 'Continue lesson' : 'Start lesson'}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="hm-stats">
        <div className="hm-stat">
          <div className="hm-stat-value">{stats.streak}<span className="ui-kpi-unit"> days</span></div>
          <div className="hm-stat-label">Streak</div>
          {returning && stats.streak === 0 && <div className="hm-streak-note">Streak reset. Start a new one today.</div>}
        </div>
        <div className="hm-stat">
          <div className="hm-stat-value">{stats.level}<span className="ui-kpi-unit"> · {stats.xp.toLocaleString()} XP</span></div>
          <div className="hm-stat-label">Level and XP</div>
          <div className="hero-bar" style={{ marginTop: 8 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelProgress} aria-label="Level progress"><div style={{ width: `${levelProgress}%` }} /></div>
        </div>
        <div className="hm-stat">
          <div className="hm-stat-value">{worldMastery}<span className="ui-kpi-unit">%</span></div>
          <div className="hm-stat-label">Mastery of World {currentWorld.number}</div>
        </div>
      </div>

      {hasData ? (
        <div className="hm-cols">
          <section className="hm-col" aria-label="Today">
            <div className="hm-col-head"><h2 className="ui-h2">Today</h2><span className="ui-index">Plan is set automatically</span></div>
            {today.length === 0 ? <p className="ui-desc">Nothing due today.</p> : today.map((t, i) => (
              t.done ? (
                <div key={i} className="hm-task hm-task-done"><span><span className="hm-check" aria-hidden="true">✓</span> {t.label}</span><span className="ui-mono">done</span></div>
              ) : (
                <Link key={i} className="hm-task" to={t.to}><span>{t.label}</span><span className="ui-mono">{t.est ?? ''}</span></Link>
              )
            ))}
          </section>
          <section className="hm-col" aria-label="Topics">
            <div className="hm-col-head"><h2 className="ui-h2">Topics</h2><Link className="ui-index" style={{ color: 'var(--action-text)' }} to="/progress">View all</Link></div>
            {topics.length === 0 ? <p className="ui-desc">Topics appear after your first practice set.</p> : topics.map(t => (
              <div key={t.topic} className="hm-topic">
                <span className="hm-topic-name">{t.topic}</span>
                <span className="hm-topic-bar" aria-hidden="true"><div style={{ width: `${t.mastery}%` }} /></span>
                <span className="hm-topic-val">{t.mastery}%</span>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <div className="hm-unlocks">
          <strong>Unlocks soon.</strong> Activity map, accuracy trends and your revision schedule appear after your first lesson and first practice set.
        </div>
      )}

      {d.heatmap.status === 'ready' && <Heatmap8 defaultRange="90D" autoScrollLatest />}
    </div>
  );
}
