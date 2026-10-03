import { Link } from 'react-router-dom';
import { Heatmap8 } from '../components/dashboard3/Heatmap8';
import '../components/dashboard3/dashboard3.css';
import '../components/dashboard3/heatmap8.css';
import { useDashboardData } from '../dashboard/useDashboard';
import { useRealtimeRefresh } from '../dashboard/useRealtimeRefresh';
import { levels, worlds } from '../data/curriculum';
import { getLesson } from '../services/contentService';
import { journeyState } from '../services/dashboardService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/dashboard.css';

export default function Home() {
  const d = useDashboardData();
  useRealtimeRefresh();
  const { stats } = usePlayer();

  const cont = d.continueLearning.data;
  const lessonMeta = cont ? getLesson(cont.lessonId) : undefined;
  const currentWorld = worlds.find(w => w.number === (cont?.worldNumber ?? 1)) ?? worlds[0];
  const worldLevels = levels.filter(l => l.worldId === currentWorld.id).slice(0, 10);
  const currentLevelId = d.journey.data?.currentLevelId ?? null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const description = cont
    ? `${cont.mode === 'begin' ? `Start with World ${cont.worldNumber}.` : `Continue World ${cont.worldNumber}.`} Your ${lessonMeta ? `${lessonMeta.estimatedMinutes}-minute` : 'next'} lesson is ready.`
    : 'All published lessons are complete.';

  const tasks: { label: string; to: string }[] = [];
  if (cont) tasks.push({ label: `Finish ${cont.lessonTitle}`, to: `/learn/lesson/${cont.lessonId}` });
  const revDue = d.revision.status === 'ready' && d.revision.data ? d.revision.data.due[0] : undefined;
  if (revDue) tasks.push({ label: `Revise ${revDue.title}`, to: revDue.kind === 'lesson' ? `/learn/lesson/${revDue.id}` : `/practice/problems/${revDue.id}` });
  if ((stats.events ?? []).length > 0 || stats.completedLessons.length > 0) tasks.push({ label: 'Practice 5 questions', to: '/practice' });
  const today = tasks.slice(0, 3);

  const topics = d.mastery.status === 'ready' && d.mastery.data
    ? [...d.mastery.data.rows].sort((a, b) => b.mastery - a.mastery).slice(0, 5)
    : [];

  const hasData = today.length > 0 || topics.length > 0;
  const masteryAvg = d.mastery.status === 'ready' && d.mastery.data ? d.mastery.data.avg : 0;

  return (
    <div className="dash">
      <header className="ui-statement">
        <h1 className="ui-h1">{greet}</h1>
        <p className="ui-desc">{description}</p>
      </header>

      {cont && (
        <section className="hm-hero" aria-label="Up next">
          <div className="hm-hero-top">
            <div>
              <div className="ui-index">Up next · World {cont.worldNumber} · {currentWorld.title}</div>
              <div className="hm-hero-title">{cont.lessonTitle}</div>
              <div className="hm-hero-meta">
                Level {cont.levelNumber} · Lesson {cont.lessonIndex} of {cont.lessonCount}
                {lessonMeta ? ` · about ${lessonMeta.estimatedMinutes} min · +${cont.xp} XP` : ''}
              </div>
            </div>
            <Link className="btn btn-primary" to={`/learn/lesson/${cont.lessonId}`}>
              {cont.mode === 'resume' ? 'Continue lesson' : 'Start lesson'}
            </Link>
          </div>
          <div className="hm-dots" role="list" aria-label={`Levels in World ${currentWorld.number}`}>
            {worldLevels.map(l => {
              const st = journeyState(stats, l.id, currentLevelId);
              const dotClass = st === 'done' ? 'done' : st === 'current' ? 'current' : st === 'locked' ? 'locked' : '';
              return (
                <Link key={l.id} role="listitem" className={`hm-dot ${dotClass}`}
                  to={`/learn/level/${l.id}`} aria-label={`Level ${l.number}, ${st}`}>{l.number}</Link>
              );
            })}
          </div>
          <div className="ui-mono">{cont.levelProgress ?? 0}% of this level</div>
        </section>
      )}

      <div className="hm-stats">
        <div className="hm-stat"><div className="hm-stat-value">{stats.streak}</div><div className="hm-stat-label">Day streak</div></div>
        <div className="hm-stat"><div className="hm-stat-value">{stats.level}</div><div className="hm-stat-label">Level · {stats.xp.toLocaleString()} XP</div></div>
        <div className="hm-stat"><div className="hm-stat-value">{masteryAvg}%</div><div className="hm-stat-label">Mastery across your topics</div></div>
      </div>

      {hasData ? (
        <div className="hm-cols">
          <section className="hm-col" aria-label="Today">
            <div className="hm-col-head"><h2 className="ui-h2">Today</h2><span className="ui-index">Plan is set automatically</span></div>
            {today.length === 0 ? <p className="ui-desc">Nothing due today.</p> :
              today.map(t => <Link key={t.to + t.label} className="hm-task" to={t.to}><span>{t.label}</span><span aria-hidden="true">›</span></Link>)}
          </section>
          <section className="hm-col" aria-label="Topics">
            <div className="hm-col-head"><h2 className="ui-h2">Topics</h2><Link className="ui-index" style={{ color: 'var(--action-text)' }} to="/progress">View all</Link></div>
            {topics.map(t => (
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

      {d.heatmap.status === 'ready' && <Heatmap8 />}
    </div>
  );
}
