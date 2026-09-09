import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, EmptyState, Progress } from '../components/common/ui';
import { projects } from '../data/projects';
import { getLevel, getLessonProgress, getLessonState, getLevelProgress, getWorld, isLevelUnlocked, publishedLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Level() {
  const { levelId } = useParams();
  const { stats, completeProject } = usePlayer();
  const level = levelId ? getLevel(levelId) : undefined;

  if (!level) return <EmptyState icon="search" title="Level not found" message="This level does not exist in the curriculum data." action={<Link className="btn btn-primary" to="/learn">Back to Curriculum</Link>} />;
  if (level.status !== 'PUBLISHED') return <EmptyState icon="lock" title="Level not published" message="This level is still in draft or archived and is not visible to learners yet." action={<Link className="btn btn-secondary" to="/learn">View Roadmap</Link>} />;
  const world = getWorld(level.worldId);

  if (!isLevelUnlocked(stats, level)) {
    return <EmptyState icon="lock" title={`Level ${level.number} is locked`} message={`Complete Level ${level.number - 1} to unlock “${level.title}”.`} action={<Link className="btn btn-secondary" to="/learn">View Roadmap</Link>} />;
  }

  const ls = publishedLessons(level);
  const prog = getLevelProgress(stats, level);
  const levelProjects = projects.filter(p => p.levelId === level.id && p.status === 'PUBLISHED');

  return (
    <>
      <Link to="/learn" className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-2)' }}><Icon name="arrow-left" size={14} /> Curriculum Roadmap</Link>
      <section className="card">
        <div className="label-mono" style={{ marginBottom: 8 }}>WORLD {String(world?.number).padStart(2, '0')} · LEVEL {String(level.number).padStart(2, '0')} · {level.difficulty}</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>{level.title}</h1>
        <p className="t-body-lg" style={{ maxWidth: 720 }}>{level.description}</p>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }} className="t-body-sm">
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-2)' }}><Icon name="clock" size={14} /> {level.estimatedHours} Hours</span>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-2)' }}><Icon name="book" size={14} /> {ls.length} Modules</span>
          <span style={{ color: 'var(--success)' }}>{prog}% complete</span>
        </div>
        <div style={{ marginTop: 16, maxWidth: 480 }}><Progress value={prog} /></div>
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
                  <Link key={lesson.id} to={state === 'locked' ? '#' : `/learn/lesson/${lesson.id}`} aria-disabled={state === 'locked'} className="card card-interactive" style={state === 'locked' ? { opacity: .55, cursor: 'not-allowed' } : {}}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 16, alignItems: 'center' }}>
                      <span className="mono t-caption" style={{ color: 'var(--fg-3)' }}>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="t-hsm">{lesson.title}</h3>
                        <p className="t-body-sm clamp-2" style={{ marginTop: 4 }}>{lesson.description}</p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }} className="t-caption">
                          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-2)' }}><Icon name="clock" size={12} /> {lesson.estimatedMinutes} min</span>
                          <span className="mono" style={{ color: 'var(--accent-soft)' }}>+{lesson.xpReward} XP</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        {state === 'completed' ? <Chip tone="success" icon="check">Completed</Chip> : state === 'in-progress' ? <Chip tone="info">In Progress · {getLessonProgress(stats, lesson)}%</Chip> : state === 'locked' ? <Chip icon="lock">Locked</Chip> : <Chip>Available</Chip>}
                        <Icon name="chevron-right" size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </section>

      {levelProjects.length > 0 && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="label-mono">PROJECTS</div>
          {levelProjects.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--border-soft)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span className="t-body" style={{ color: 'var(--fg-0)', fontWeight: 500 }}>{p.title}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Chip tone={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{p.difficulty}</Chip>
                  <Chip tone="info">+{p.xp} XP</Chip>
                </div>
              </div>
              <p className="t-body-sm">{p.description}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.requirements.map(r => <li key={r} className="t-caption" style={{ color: 'var(--fg-2)' }}>· {r}</li>)}
              </ul>
              {stats.completedProjects.includes(p.id)
                ? <Chip tone="success" icon="check">COMPLETED</Chip>
                : <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => completeProject(p.id, p.xp)}>Mark as complete</button>}
            </div>
          ))}
        </section>
      )}

      <section className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="label-mono" style={{ marginBottom: 6 }}>MASTERY STATUS</div>
          <p className="t-body">{prog === 100 && ls.length > 0 ? 'Level mastered. All modules verified.' : `${ls.filter(l => stats.completedLessons.includes(l.id)).length} of ${ls.length} modules verified.`}</p>
        </div>
        {prog === 100 && ls.length > 0 ? <Chip tone="success" icon="award">MASTERED</Chip> : <Chip>IN TRAINING</Chip>}
      </section>
    </>
  );
}
