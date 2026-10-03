import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ContentRenderer } from '../components/lesson/ContentRenderer';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { PublishedConcepts } from '../components/lesson/PublishedConcepts';
import { EmptyState, SectionIndex, StatementHeader } from '../components/ui/primitives';
import { lessons as dataLessons } from '../data/lessons';
import { getLevel, getLessonProgress, getLessonState, getWorld, publishedLessons } from '../services/progressService';
import * as contentStore from '../services/contentStore';
import { usePlayer } from '../store/PlayerContext';
import type { Lesson } from '../types';
import '../components/dashboard3/pagev4.css';

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
      <div className="ui-panel">
        <StatementHeader lead="Lesson not found —" emphasis="it may have been unpublished or moved." />
        <EmptyState action={<Link className="btn btn-secondary btn-sm" to="/learn">Back to Curriculum</Link>}>
          No lesson exists at this address.
        </EmptyState>
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <div className="ui-panel">
        <StatementHeader lead={lesson.title} emphasis="is locked." />
        <EmptyState action={<Link className="btn btn-secondary btn-sm" to={`/learn/level/${lesson.levelId}`}>View level</Link>}>
          Complete the previous lessons in this level to unlock it.
        </EmptyState>
      </div>
    );
  }

  const blocks = (lesson as any).blocks ?? (lesson as any).sections ?? (lesson as any).content ?? [];

  return (
    <>
      <StatementHeader
        lead={`World ${world?.number ?? '—'} · Level ${level?.number ?? '—'} · Lesson ${idx + 1}/${siblings.length}`}
        emphasis={lesson.title}
      />

      <div className="v4-meta">
        <div className="ui-pod"><span className="ui-index">Duration</span><span className="ui-mono" style={{ color: 'var(--text-primary)' }}>{lesson.estimatedMinutes} min</span></div>
        <div className="ui-pod"><span className="ui-index">Reward</span><span className="ui-mono" style={{ color: 'var(--text-primary)' }}>+{lesson.xpReward} XP</span></div>
        <div className="ui-pod">
          <span className="ui-index">Progress</span>
          <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Lesson progress"><div style={{ width: `${progress}%` }} /></div>
          <span className="ui-mono ui-muted">{progress}% complete</span>
        </div>
      </div>

      <SectionIndex index="01" label="Read" />
      <div className="reading">
        <ContentRenderer blocks={blocks} />
        <div style={{ marginTop: 24 }}>
          <PublishedConcepts lessonId={lesson.id} />
        </div>
      </div>

      {lesson.practice.length > 0 && (
        <>
          <SectionIndex index="02" label="Knowledge check" />
          <div className="ui-panel">
            <PracticeEngine questions={lesson.practice} title={lesson.title} />
          </div>
        </>
      )}

      {lesson.masteryTest.length > 0 && (
        <>
          <SectionIndex index="03" label="Mastery test" />
          <div className="ui-panel">
            <PracticeEngine questions={lesson.masteryTest} title={`${lesson.title} — mastery`} />
          </div>
        </>
      )}

      <SectionIndex index="04" label="Complete" />
      <div className="ui-panel" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ui-pod-title">{completed ? 'Lesson completed' : 'Finish this lesson'}</div>
          <div className="ui-mono ui-muted" style={{ marginTop: 4 }}>
            {completed ? `+${lesson.xpReward} XP awarded` : 'Complete the checks above, then mark complete.'}
          </div>
        </div>
        {!completed && (
          <button type="button" className="btn btn-primary" onClick={() => completeLesson(lesson.id, lesson.xpReward)}>Mark complete</button>
        )}
      </div>

      <nav style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, flexWrap: 'wrap' }} aria-label="Lesson navigation">
        {prev ? <Link className="btn btn-ghost" to={`/learn/lesson/${prev.id}`}>← {prev.title}</Link> : <span />}
        {nextLesson
          ? <Link className="btn btn-secondary" to={`/learn/lesson/${nextLesson.id}`}>{nextLesson.title} →</Link>
          : <Link className="btn btn-secondary" to={`/learn/level/${lesson.levelId}`}>Back to level</Link>}
      </nav>
    </>
  );
}
