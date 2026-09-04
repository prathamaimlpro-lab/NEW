import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ContentRenderer } from '../components/lesson/ContentRenderer';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { Icon } from '../components/common/Icon';
import { Chip, EmptyState, Progress } from '../components/common/ui';
import { lessons } from '../data/curriculum';
import { getCourse, getLessonProgress, getNextLesson, isLessonUnlocked } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Lesson() {
  const { lessonId } = useParams();
  const lesson = lessonId ? lessons[lessonId] : undefined;
  const { stats, visitLesson, completeLesson } = usePlayer();
  const [practiceDone, setPracticeDone] = useState(false);
  const [masteryDone, setMasteryDone] = useState(false);

  useEffect(() => { if (lesson) visitLesson(lesson.id); }, [lesson?.id]);

  if (!lesson || lesson.status !== 'PUBLISHED') {
    return <EmptyState icon="search" title="Lesson unavailable" message="This lesson does not exist or has not been published yet." action={<Link className="btn btn-primary" to="/learn">Back to Curriculum</Link>} />;
  }
  if (!isLessonUnlocked(stats, lesson)) {
    return <EmptyState icon="lock" title="Lesson locked" message={`Complete the previous module to unlock “${lesson.title}”.`} action={<Link className="btn btn-secondary" to={`/learn/level/${lesson.levelId}`}>Back to Level</Link>} />;
  }

  const course = getCourse(lesson.courseId);
  const totalInLevel = course?.lessons.length ?? 1;
  const prog = getLessonProgress(stats, lesson);
  const completed = stats.completedLessons.includes(lesson.id);
  const next = getNextLesson(stats);

  const finish = () => { if (!completed) completeLesson(lesson.id, lesson.xpReward); };

  return (
    <div className="reading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to={`/learn/level/${lesson.levelId}`} className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-muted)' }}>
          <Icon name="arrow-left" size={14} /> Level {lesson.levelId}: {course?.title.split('—')[0]}
        </Link>
        <span className="t-body-sm" style={{ display: 'inline-flex', gap: 12, color: 'var(--fg-muted)' }}>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={14} /> {lesson.estimatedMinutes} min read</span>
          <span className="mono" style={{ color: '#a5a1ff' }}>+{lesson.xpReward} XP</span>
        </span>
      </div>

      <div style={{ margin: '16px 0 8px' }}><Progress value={prog} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="label-mono">
        <span>PHASE // {course?.title.split('—')[0].trim().toUpperCase()}</span>
        <span>LESSON {String(lesson.index).padStart(2, '0')} OF {String(totalInLevel).padStart(2, '0')}</span>
      </div>

      <header style={{ margin: '32px 0' }}>
        <div className="label-mono" style={{ marginBottom: 12 }}>FOUNDATIONAL ARCHITECTURE</div>
        <h1 className="t-display" style={{ marginBottom: 16 }}>{lesson.title}</h1>
        <p className="t-body-lg">{lesson.description}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {lesson.sections.map(section => (
          <section key={section.id}>
            {section.label && <div className="label-mono" style={{ marginBottom: 10 }}>{section.label}</div>}
            {section.title && <h2 className="t-hmd" style={{ marginBottom: 16 }}>{section.title}</h2>}
            <ContentRenderer blocks={section.blocks} />
          </section>
        ))}
      </div>

      <section style={{ marginTop: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div><div className="label-mono">CONCEPT CHECKPOINT</div><h2 className="t-hmd" style={{ marginTop: 6 }}>Apply Your Knowledge</h2></div>
        </div>
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
              <div><div className="label-mono" style={{ marginBottom: 4 }}>NEXT UP</div><span className="t-body" style={{ color: 'var(--fg-primary)' }}>Lesson {String(next.index).padStart(2, '0')}: {next.title}</span></div>
              <Link className="btn btn-primary" to={`/learn/lesson/${next.id}`}>Continue <Icon name="arrow-right" size={16} /></Link>
            </div>
          ) : <p className="t-body" style={{ color: 'var(--fg-muted)' }}>Track complete. New modules are being authored.</p>}
        </section>
      )}

      {!completed && !masteryDone && lesson.practice.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Chip>COMPLETE PRACTICE + MASTERY TO VERIFY THIS LESSON</Chip>
        </div>
      )}
    </div>
  );
}
