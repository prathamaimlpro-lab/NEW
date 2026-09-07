import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { CadenceChart, Chip, Progress } from '../components/common/ui';
import { achievementsData } from '../data/achievements';
import { lessons } from '../data/curriculum';
import { getLevel, getLessonProgress, getLessonState, getNextLesson, getWorld } from '../services/progressService';
import { getSettings } from '../services/contentStore';
import { getTierName, getXpForNextLevel, getXpProgress, todayKey } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';

export default function Home() {
  const { stats } = usePlayer();
  const next = getNextLesson(stats);
  const level = next ? getLevel(next.levelId) : undefined;
  const world = level ? getWorld(level.worldId) : undefined;
  const goal = getSettings().dailyGoalMinutes;
  const todayMin = stats.activity[todayKey()]?.minutes ?? 0;
  const dailyPct = Math.min(100, Math.round((todayMin / goal) * 100));
  const milestones = [...stats.unlockedAchievements].slice(-3).reverse();
  const moduleLessons = level ? level.lessons.map(id => lessons[id]).filter(Boolean) : [];

  return (
    <>
      <section className="card" style={{ padding: 'clamp(22px, 3.4vw, 36px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 28, alignItems: 'center' }} className="hero-grid">
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <Chip tone="info">{world ? `WORLD ${world.number} · ${world.title.toUpperCase()}` : 'TRACK COMPLETE'}</Chip>
              {level && <span className="label-mono">LEVEL {String(level.number).padStart(2, '0')}</span>}
            </div>
            <h1 className="t-display" style={{ marginBottom: 12 }}>{next ? next.title : 'Journey Complete'}</h1>
            <p className="t-body-lg clamp-2" style={{ maxWidth: 620 }}>{next ? next.description : 'You have completed every published lesson. New content is being authored.'}</p>
            {next && level && (
              <div style={{ marginTop: 22, maxWidth: 620 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="t-body-sm">{getLessonProgress(stats, next) > 0 ? 'In progress' : 'Not started'}</span>
                  <span className="t-body-sm" style={{ color: 'var(--fg-0)' }}>{getLessonProgress(stats, next)}%</span>
                </div>
                <Progress value={getLessonProgress(stats, next)} />
                <div style={{ display: 'flex', gap: 18, marginTop: 12, color: 'var(--fg-2)' }} className="t-body-sm">
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={14} /> {next.estimatedMinutes} min</span>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="explore" size={14} /> Interactive visualization</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 250 }} className="hero-actions">
            {next && <Link className="btn btn-primary" style={{ minHeight: 50 }} to={`/learn/lesson/${next.id}`}>Continue Learning <Icon name="arrow-right" size={16} /></Link>}
            <Link className="btn btn-secondary" style={{ minHeight: 50 }} to="/progress"><Icon name="notes" size={16} /> Review Progress</Link>
          </div>
        </div>
      </section>

      <section className="card grid-3">
        <div style={{ padding: '4px 20px' }}>
          <div className="label-mono" style={{ marginBottom: 10 }}>DAILY LEARNING</div>
          <div className="t-hmd">{todayMin} <span className="t-body-sm" style={{ color: 'var(--fg-2)' }}>/ {goal} min</span></div>
          <div style={{ marginTop: 12 }}><Progress value={dailyPct} tone="info" /></div>
        </div>
        <div style={{ padding: '4px 20px', borderLeft: '1px solid rgba(255,255,255,.08)', borderRight: '1px solid rgba(255,255,255,.08)' }}>
          <div className="label-mono" style={{ marginBottom: 10 }}>STREAK</div>
          <div className="t-hmd">{stats.streak} <span className="t-body-sm" style={{ color: 'var(--fg-2)' }}>days</span></div>
          <p className="t-caption" style={{ marginTop: 10 }}>Best: {stats.bestStreak} days</p>
        </div>
        <div style={{ padding: '4px 20px' }}>
          <div className="label-mono" style={{ marginBottom: 10 }}>PROFICIENCY</div>
          <div className="t-hmd">{stats.xp.toLocaleString()} <span className="t-body-sm" style={{ color: 'var(--fg-2)' }}>XP</span></div>
          <p className="t-caption" style={{ marginTop: 10 }}>Level {stats.level} {getTierName(stats.level)} · {getXpForNextLevel(stats.xp) > 0 ? `${getXpForNextLevel(stats.xp)} XP to next` : 'max tier'} ({getXpProgress(stats.xp)}%)</p>
        </div>
      </section>

      {level && (
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <h2 className="t-hmd">Level {level.number}: {level.title} <span className="t-body-sm" style={{ color: 'var(--fg-2)' }}>· {moduleLessons.length} modules</span></h2>
            <Link to="/learn" style={{ color: 'var(--accent-soft)', display: 'inline-flex', gap: 6, alignItems: 'center' }} className="t-body">Curriculum <Icon name="chevron-right" size={14} /></Link>
          </div>
          {moduleLessons.map((lesson, i) => {
            const state = getLessonState(stats, lesson);
            const prog = getLessonProgress(stats, lesson);
            const chip = state === 'completed' ? <Chip tone="success">Completed</Chip> : state === 'in-progress' ? <Chip tone="info">In Progress</Chip> : state === 'locked' ? <Chip icon="lock">Locked</Chip> : <Chip>Available</Chip>;
            return (
              <Link key={lesson.id} to={state === 'locked' ? '#' : `/learn/lesson/${lesson.id}`} aria-disabled={state === 'locked'} className="home-row" style={state === 'locked' ? { opacity: .5 } : {}}>
                <span className="mono t-caption" style={{ color: 'var(--fg-3)' }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="t-body" style={{ color: 'var(--fg-0)', fontWeight: 500 }}>{lesson.title}</div>
                  <div className="t-caption clamp-2">{lesson.description}</div>
                </div>
                {chip}
                <div style={{ textAlign: 'right' }}>
                  {state === 'in-progress' || state === 'completed'
                    ? <><Progress value={prog} /><div className="t-caption" style={{ marginTop: 6 }}>{prog}%</div></>
                    : <span className="mono t-caption" style={{ color: 'var(--accent-soft)' }}>+{lesson.xpReward} XP</span>}
                </div>
              </Link>
            );
          })}
        </section>
      )}

      <section className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div><div className="label-mono">SESSION LOG</div><h3 className="t-hsm" style={{ marginTop: 4 }}>Weekly Cadence</h3></div>
            <span className="t-caption">{(Object.values(stats.activity).reduce((a, b) => a + b.minutes, 0) / 60).toFixed(1)} hrs total</span>
          </div>
          <div style={{ marginTop: 20 }}><CadenceChart activity={stats.activity} /></div>
        </div>
        <div className="card">
          <div className="label-mono">RECENT MILESTONES</div>
          <h3 className="t-hsm" style={{ marginTop: 4, marginBottom: 14 }}>Achievements</h3>
          {milestones.length === 0 && <p className="t-body-sm" style={{ color: 'var(--fg-2)' }}>No milestones yet — complete your first lesson to begin.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map(id => {
              const a = achievementsData.find(x => x.id === id);
              if (!a) return null;
              return (
                <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,.06)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 12 }}>
                  <span style={{ color: 'var(--success)' }}><Icon name={a.icon} size={18} /></span>
                  <div style={{ flex: 1 }}><div className="t-body" style={{ color: 'var(--fg-0)' }}>{a.title}</div><div className="t-caption">{a.description}</div></div>
                  {a.xp > 0 && <Chip tone="success">+{a.xp} XP</Chip>}
                </div>
              );
            })}
          </div>
          <Link to="/achievements" className="t-body" style={{ display: 'inline-flex', gap: 6, marginTop: 14, color: 'var(--accent-soft)' }}>View all <Icon name="chevron-right" size={14} /></Link>
        </div>
      </section>
    </>
  );
}
