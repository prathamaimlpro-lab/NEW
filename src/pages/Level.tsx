import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, EmptyState, Progress } from '../components/common/ui';
import { getLevel, getLessonProgress, getLessonState, getLevelProgress, isLevelUnlocked, levelLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Level() {
  const { levelId } = useParams();
  const { stats } = usePlayer();
  const level = getLevel(Number(levelId));

  if (!level) return <EmptyState icon="search" title="Level not found" message="This level does not exist in the curriculum data." action={<Link className="btn btn-primary" to="/learn">Back to Curriculum</Link>} />;

  if (!isLevelUnlocked(stats, level.id)) {
    return <EmptyState icon="lock" title={`Level ${level.id} is locked`} message={`Complete Level ${level.id - 1} to unlock ${level.title}.`} action={<Link className="btn btn-secondary" to="/learn">View Roadmap</Link>} />;
  }

  const ls = levelLessons(level);
  const prog = getLevelProgress(stats, level);

  return (
    <>
      <Link to="/learn" className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="arrow-left" size={14} /> Curriculum Roadmap</Link>
      <section className="card">
        <div className="label-mono" style={{ marginBottom: 8 }}>LEVEL {String(level.id).padStart(2, '0')} · {level.group.toUpperCase()}</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>{level.title}</h1>
        <p className="t-body-lg" style={{ maxWidth: 720 }}>{level.description}</p>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }} className="t-body-sm">
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="clock" size={14} /> {level.estimatedHours} Hours</span>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="book" size={14} /> {ls.length} Modules</span>
          <span style={{ color: 'var(--success)' }}>{prog}% complete</span>
        </div>
        <div style={{ marginTop: 16, maxWidth: 480 }}><Progress value={prog} /></div>
      </section>

      <section className="card">
        <div className="label-mono" style={{ marginBottom: 12 }}>LEARNING OBJECTIVES</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {level.objectives.map(o => (
            <li key={o} className="t-body" style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--fg-secondary)' }}>
              <span style={{ color: 'var(--success)' }}><Icon name="check" size={14} /></span>{o}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="t-hmd" style={{ marginBottom: 16 }}>Modules</h2>
        {ls.length === 0
          ? <EmptyState icon="book" title="Lessons in authoring" message="Modules for this level are being written and reviewed. They will appear here once published." />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ls.map((lesson, i) => {
                const state = getLessonState(stats, lesson);
                return (
                  <Link key={lesson.id} to={state === 'locked' ? '#' : `/learn/lesson/${lesson.id}`} aria-disabled={state === 'locked'}
                    className="card card-interactive" style={state === 'locked' ? { opacity: .55, cursor: 'not-allowed' } : {}}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 16, alignItems: 'center' }}>
                      <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="t-hsm">{lesson.title}</h3>
                        <p className="t-body-sm clamp-2" style={{ marginTop: 4 }}>{lesson.description}</p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }} className="t-caption">
                          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="clock" size={12} /> {lesson.estimatedMinutes} min</span>
                          <span className="mono" style={{ color: '#a5a1ff' }}>+{lesson.xpReward} XP</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        {state === 'completed' ? <Chip tone="success" icon="check">Completed</Chip>
                          : state === 'in-progress' ? <Chip tone="primary">In Progress · {getLessonProgress(stats, lesson)}%</Chip>
                          : state === 'locked' ? <Chip icon="lock">Locked</Chip>
                          : i === 0 || state === 'available' ? <Chip>Available</Chip> : null}
                        <Icon name="chevron-right" size={16} className="" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </section>

      <section className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="label-mono" style={{ marginBottom: 6 }}>MASTERY STATUS</div>
          <p className="t-body">{prog === 100 ? 'Level mastered. All modules verified.' : `${ls.filter(l => stats.completedLessons.includes(l.id)).length} of ${ls.length} modules verified.`}</p>
        </div>
        {prog === 100 ? <Chip tone="success" icon="award">MASTERED</Chip> : <Chip>IN TRAINING</Chip>}
      </section>
    </>
  );
}
