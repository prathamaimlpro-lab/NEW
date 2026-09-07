import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { EmptyState, Progress } from '../components/common/ui';
import { ContentRenderer } from '../components/lesson/ContentRenderer';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { VisualizationRenderer } from '../components/visualization/registry';
import { lessons } from '../data/curriculum';
import { getLessonProgress, getLevel, getNextLesson, getWorld, isLessonUnlocked } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Lesson() {
  const { lessonId } = useParams();
  const lesson = lessonId ? lessons[lessonId] : undefined;
  const { stats, visitLesson, completeLesson, completeVisualization } = usePlayer();
  const [practiceDone, setPracticeDone] = useState(false);
  const [masteryDone, setMasteryDone] = useState(false);

  useEffect(() => { if (lesson) visitLesson(lesson.id); }, [lesson?.id]);

  if (!lesson || lesson.status !== 'PUBLISHED') return <EmptyState icon="search" title="Lesson unavailable" message="This lesson does not exist or has not been published yet." action={<Link className="btn btn-primary" to="/learn">Back to Curriculum</Link>} />;
  if (!isLessonUnlocked(stats, lesson)) return <EmptyState icon="lock" title="Lesson locked" message={`Complete the previous module to unlock “${lesson.title}”.`} action={<Link className="btn btn-secondary" to={`/learn/level/${lesson.levelId}`}>Back to Level</Link>} />;

  const level = getLevel(lesson.levelId);
  const world = level ? getWorld(level.worldId) : undefined;
  const prog = getLessonProgress(stats, lesson);
  const completed = stats.completedLessons.includes(lesson.id);
  const next = getNextLesson(stats);
  const finish = () => { if (!completed) completeLesson(lesson.id, lesson.xpReward); };

  return (
    <div className="reading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to={`/learn/level/${lesson.levelId}`} className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-muted)' }}>
          <Icon name="arrow-left" size={14} /> Level {level?.number}: {level?.title}
        </Link>
        <span className="t-body-sm" style={{ display: 'inline-flex', gap: 12, color: 'var(--fg-muted)' }}>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={14} /> {lesson.estimatedMinutes} min read</span>
          <span className="mono" style={{ color: '#a5a1ff' }}>+{lesson.xpReward} XP</span>
        </span>
      </div>

      <div style={{ margin: '16px 0 8px' }}><Progress value={prog} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="label-mono">
        <span>WORLD {String(world?.number).padStart(2, '0')} // {world?.title.toUpperCase()}</span>
        <span>LEVEL {String(level?.number).padStart(2, '0')}</span>
      </div>

      <header style={{ margin: '32px 0' }}>
        <div className="label-mono" style={{ marginBottom: 12 }}>LESSON OBJECTIVE</div>
        <h1 className="t-display" style={{ marginBottom: 16 }}>{lesson.title}</h1>
        <p className="t-body-lg">{lesson.description}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {lesson.objectives.map(o => <li key={o} className="t-body" style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--fg-secondary)' }}><span style={{ color: 'var(--success)' }}><Icon name="check" size={14} /></span>{o}</li>)}
        </ul>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {lesson.sections.map(section => (
          <section key={section.id}>
            {section.label && <div className="label-mono" style={{ marginBottom: 10 }}>{section.label}</div>}
            {section.title && <h2 className="t-hmd" style={{ marginBottom: 16 }}>{section.title}</h2>}
            <ContentRenderer blocks={section.blocks} />
          </section>
        ))}
        {lesson.visualizationId && (
          <section>
            <div className="label-mono" style={{ marginBottom: 10 }}>INTERACTIVE VISUALIZATION</div>
            <VisualizationRenderer id={lesson.visualizationId} onCompleted={(id, xp) => completeVisualization(id, xp)} />
          </section>
        )}
      </div>

      <section style={{ marginTop: 56 }}>
        <div className="label-mono" style={{ marginBottom: 6 }}>CONCEPT CHECKPOINT</div>
        <h2 className="t-hmd" style={{ marginBottom: 16 }}>Apply Your Knowledge</h2>
        <PracticeEngine questions={lesson.practice} title="Practice" onComplete={() => setPracticeDone(true)} />
      </section>

      {(practiceDone || lesson.practice.length === 0) && lesson.masteryTest.length > 0 && (
        <section style={{ marginTop: 32 }} className="fade-in">
          <div className="label-mono" style={{ marginBottom: 16 }}>MASTERY CHECK</div>
          <PracticeEngine questions={lesson.masteryTest} title="Mastery check" onComplete={() => { setMasteryDone(true); finish(); }} />
        </section>
      )}

      {(completed || masteryDone) && (
        <section className="card fade-in" style={{ marginTop: 32, borderColor: 'rgba(16,185,129,.4)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: 'var(--success)' }}><Icon name="check-circle" size={22} /></span>
            <h2 className="t-hsm">Lesson verified · +{lesson.xpReward} XP</h2>
          </div>
          {next && next.id !== lesson.id ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              <div><div className="label-mono" style={{ marginBottom: 4 }}>NEXT UP</div><span className="t-body" style={{ color: 'var(--fg-primary)' }}>{next.title}</span></div>
              <Link className="btn btn-primary" to={`/learn/lesson/${next.id}`}>Continue <Icon name="arrow-right" size={16} /></Link>
            </div>
          ) : <p className="t-body" style={{ color: 'var(--fg-muted)' }}>Track complete. New modules are being authored.</p>}
        </section>
      )}
    </div>
  );
}
