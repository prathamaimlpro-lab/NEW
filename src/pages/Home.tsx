import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { CadenceChart, Chip, Progress } from '../components/common/ui';
import { achievementsData } from '../data/achievements';
import { lessons } from '../data/curriculum';
import { getLevel, getLessonProgress, getLessonState, getNextLesson, getWorld } from '../services/progressService';
import { getTierName, getXpForNextLevel, getXpProgress, todayKey } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';

export default function Home() {
  const { stats } = usePlayer();
  const next = getNextLesson(stats);
  const level = next ? getLevel(next.levelId) : undefined;
  const world = level ? getWorld(level.worldId) : undefined;
  const todayMin = stats.activity[todayKey()]?.minutes ?? 0;
  const dailyPct = Math.min(100, Math.round((todayMin / 20) * 100));
  const milestones = [...stats.unlockedAchievements].slice(-3).reverse();
  const moduleLessons = level ? level.lessons.map(id => lessons[id]).filter(Boolean) : [];

  return (
    <>
      <section className="card" style={{ background: 'linear-gradient(120deg, var(--surface) 55%, rgba(79,70,229,.08))' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center' }} className="hero-grid">
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <Chip tone="primary">{world ? `WORLD ${world.number} · ${world.title.toUpperCase()}` : 'TRACK COMPLETE'}</Chip>
              {level && <span className="label-mono">/ LEVEL {String(level.number).padStart(2, '0')}</span>}
            </div>
            <h1 className="t-display" style={{ marginBottom: 12 }}>{next ? next.title : 'Journey Complete'}</h1>
            <p className="t-body-lg clamp-2" style={{ maxWidth: 640 }}>{next ? next.description : 'You have completed every published lesson. New content is being authored.'}</p>
            {next && level && (
              <div style={{ marginTop: 20, maxWidth: 640 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="t-body-sm" style={{ color: 'var(--fg-secondary)' }}>● {getLessonProgress(stats, next) > 0 ? 'In progress' : 'Not started'}</span>
                  <span className="t-body-sm" style={{ color: 'var(--fg-primary)' }}>{getLessonProgress(stats, next)}% Completed</span>
                </div>
                <Progress value={getLessonProgress(stats, next)} />
                <div style={{ display: 'flex', gap: 16, marginTop: 10, color: 'var(--fg-muted)' }} className="t-body-sm">
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={14} /> {next.estimatedMinutes} min</span>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="terminal" size={14} /> Interactive visualization included</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 }} className="hero-actions">
            {next && <Link className="btn btn-primary" style={{ minHeight: 48 }} to={`/learn/lesson/${next.id}`}>Continue Learning <Icon name="arrow-right" size={16} /></Link>}
            <Link className="btn btn-secondary" style={{ minHeight: 48 }} to="/progress"><Icon name="notes" size={16} /> Review Notes</Link>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span className="label-mono">DAILY SESSION</span><span style={{ color: 'var(--info)' }}><Icon name="clock" size={16} /></span></div>
          <div className="t-hlg">{todayMin} <span className="t-body" style={{ color: 'var(--fg-muted)' }}>/ 20 min</span></div>
          <div style={{ marginTop: 16 }}><Progress value={dailyPct} tone="info" /></div>
          <p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{dailyPct}% of today’s goal</p>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span className="label-mono">CONSISTENCY</span><span style={{ color: 'var(--success)' }}><Icon name="flame" size={16} /></span></div>
          <div className="t-hlg">{stats.streak} <span className="t-body" style={{ color: 'var(--fg-muted)' }}>Days Active</span></div>
          <p className="t-caption" style={{ marginTop: 8, color: 'var(--success)' }}>All-time best: {stats.bestStreak}</p>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span className="label-mono">PROFICIENCY TIER</span><span style={{ color: '#a5a1ff' }}><Icon name="shield" size={16} /></span></div>
          <div className="t-hlg">{stats.xp.toLocaleString()} <span className="t-body" style={{ color: 'var(--fg-muted)' }}>XP</span></div>
          <div style={{ marginTop: 8 }}><Chip tone="primary">LEVEL {stats.level} {getTierName(stats.level).toUpperCase()}</Chip></div>
          <p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>Next milestone: {getXpForNextLevel(stats.xp) > 0 ? `${getXpForNextLevel(stats.xp)} XP left (${getXpProgress(stats.xp)}%)` : 'max tier'}</p>
        </div>
      </section>

      {level && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
            <h2 className="t-hmd">Level {level.number}: {level.title} <span className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>· {moduleLessons.length} Modules</span></h2>
            <Link to="/learn" style={{ color: '#a5a1ff', display: 'inline-flex', gap: 6, alignItems: 'center' }} className="t-body">Curriculum syllabus <Icon name="chevron-right" size={14} /></Link>
          </div>
          <div className="grid-4">
            {moduleLessons.map((lesson, i) => {
              const state = getLessonState(stats, lesson);
              const prog = getLessonProgress(stats, lesson);
              const chip = state === 'completed' ? <Chip tone="success">Completed</Chip> : state === 'in-progress' ? <Chip tone="primary">In Progress</Chip> : state === 'locked' ? <Chip icon="lock">Locked</Chip> : <Chip>Available</Chip>;
              return (
                <Link key={lesson.id} to={state === 'locked' ? '#' : `/learn/lesson/${lesson.id}`} aria-disabled={state === 'locked'} className="card card-interactive" style={state === 'locked' ? { opacity: .55, cursor: 'not-allowed' } : {}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>{String(i + 1).padStart(2, '0')}</span>{chip}
                  </div>
                  <h3 className="t-hsm clamp-2" style={{ marginBottom: 8 }}>{lesson.title}</h3>
                  <p className="t-body-sm clamp-2">{lesson.description}</p>
                  <div style={{ marginTop: 16 }}>
                    {state === 'in-progress' || state === 'completed' ? (
                      <><Progress value={prog} /><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }} className="t-caption"><span>{prog}% complete</span><span className="mono">{lesson.estimatedMinutes} min</span></div></>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="t-caption">
                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={12} /> {lesson.estimatedMinutes} min</span>
                        <span className="mono" style={{ color: '#a5a1ff' }}>+{lesson.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div><div className="label-mono">SESSION LOG</div><h3 className="t-hsm" style={{ marginTop: 4 }}>Weekly Cadence</h3></div>
            <span className="t-caption" style={{ color: 'var(--fg-muted)' }}>{(Object.values(stats.activity).reduce((a, b) => a + b.minutes, 0) / 60).toFixed(1)} hrs total</span>
          </div>
          <div style={{ marginTop: 24 }}><CadenceChart activity={stats.activity} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }} className="t-caption">
            <span style={{ color: 'var(--success)' }}>● Rolling window</span><span style={{ color: 'var(--fg-muted)' }}>Last 7 days</span>
          </div>
        </div>
        <div className="card">
          <div className="label-mono">RECENT MILESTONES</div>
          <h3 className="t-hsm" style={{ marginTop: 4, marginBottom: 16 }}>Verified Achievements</h3>
          {milestones.length === 0 && <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>No milestones yet — complete your first lesson to begin.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map(id => {
              const a = achievementsData.find(x => x.id === id);
              if (!a) return null;
              return (
                <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 12 }}>
                  <span style={{ color: 'var(--success)' }}><Icon name={a.icon} size={18} /></span>
                  <div style={{ flex: 1 }}><div className="t-body" style={{ color: 'var(--fg-primary)' }}>{a.title}</div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>{a.description}</div></div>
                  {a.xp > 0 && <Chip tone="success">+{a.xp} XP</Chip>}
                </div>
              );
            })}
          </div>
          <Link to="/achievements" className="t-body" style={{ display: 'inline-flex', gap: 6, marginTop: 16, color: '#a5a1ff' }}>View certificate log <Icon name="chevron-right" size={14} /></Link>
        </div>
      </section>
      <style>{`@media (max-width: 900px){ .hero-grid{grid-template-columns:1fr !important;} .hero-actions{min-width:0 !important;} }`}</style>
    </>
  );
}
