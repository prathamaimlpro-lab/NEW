import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ContentRenderer } from '../components/lesson/ContentRenderer';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { PublishedConcepts } from '../components/lesson/PublishedConcepts';
import { lessons as dataLessons } from '../data/lessons';
import { getLevel, getLessonProgress, getLessonState, getWorld, publishedLessons } from '../services/progressService';
import * as contentStore from '../services/contentStore';
import { usePlayer } from '../store/PlayerContext';
import type { Lesson } from '../types';

/* Prefer the admin-editable content store; fall back to the bundled seed. */
const source: Record<string, Lesson> =
  typeof (contentStore as any).getLessons === 'function' ? (contentStore as any).getLessons() : dataLessons;

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const { stats, completeLesson } = usePlayer();

  const lesson = source[lessonId];
  const level = lesson ? getLevel(lesson.levelId) : undefined;
  const world = level ? getWorld(level.worldId) : undefined;
  const state = lesson ? getLessonState(stats, lesson) : undefined;
  const progress = lesson ? getLessonProgress(stats, lesson) : 0;
  const completed = !!lesson && stats.completedLessons.includes(lesson.id);

  const siblings = useMemo(() => (level ? publishedLessons(level) : []), [level]);
  const idx = siblings.findIndex(l => l.id === lessonId);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const nextLesson = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;

  if (!lesson) {
    return (
      <div className="card">
        <h1 className="t-hmd">Lesson not found</h1>
        <p className="t-body" style={{ marginTop: 8 }}>This lesson may have been unpublished or moved.</p>
        <Link className="btn btn-secondary" style={{ marginTop: 16 }} to="/learn">Back to Curriculum</Link>
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <div className="card">
        <h1 className="t-hmd">{lesson.title}</h1>
        <p className="t-body" style={{ marginTop: 8 }}>This lesson is locked. Complete the previous lessons in this level to unlock it.</p>
        <Link className="btn btn-secondary" style={{ marginTop: 16 }} to={`/learn/level/${lesson.levelId}`}>View level</Link>
      </div>
    );
  }

  return (
    <>
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>
          {world ? `W${world.number} · ${world.title}` : ''}{level ? ` · Level ${level.number}` : ''}
        </div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>{lesson.title}</h1>
        <p className="d-micro" style={{ marginTop: 8 }}>
          {lesson.estimatedMinutes} min · +{lesson.xpReward} XP · {progress}% complete
        </p>
      </header>

      <div className="reading" style={{ marginTop: 24 }}>
        <ContentRenderer lesson={lesson} />
        <div style={{ marginTop: 24 }}>
          <PublishedConcepts lessonId={lesson.id} />
        </div>
      </div>

      {lesson.practice.length > 0 && (
        <section className="card" style={{ marginTop: 24 }}>
          <div className="d-eyebrow" style={{ marginBottom: 12 }}>Knowledge check</div>
          <PracticeEngine questions={lesson.practice} title={lesson.title} />
        </section>
      )}

      {lesson.masteryTest.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <div className="d-eyebrow" style={{ marginBottom: 12 }}>Mastery test</div>
          <PracticeEngine questions={lesson.masteryTest} title={`${lesson.title} — mastery`} />
        </section>
      )}

      <section className="card" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <div className="d-title">{completed ? 'Lesson completed' : 'Finish this lesson'}</div>
          <div className="d-micro" style={{ marginTop: 4 }}>
            {completed ? `+${lesson.xpReward} XP awarded` : 'Complete the checks above, then mark complete.'}
          </div>
        </div>
        {!completed && (
          <button type="button" className="btn btn-primary" onClick={() => completeLesson(lesson.id, lesson.xpReward)}>
            Mark complete
          </button>
        )}
      </section>

      <nav style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }} aria-label="Lesson navigation">
        {prev ? <Link className="btn btn-ghost" to={`/learn/lesson/${prev.id}`}>← {prev.title}</Link> : <span />}
        {nextLesson
          ? <Link className="btn btn-secondary" to={`/learn/lesson/${nextLesson.id}`}>{nextLesson.title} →</Link>
          : <Link className="btn btn-secondary" to={`/learn/level/${lesson.levelId}`}>Back to level</Link>}
      </nav>
    </>
  );
}
