import { useEffect, useMemo, useState } from 'react';
import { AssessmentRunner } from '../assessment/AssessmentRunner';
import { hydrateRemote } from '../../services/contentRepo';
import { getAssessmentsForLesson } from '../../services/assessmentService';
import { getConceptsForLesson } from '../../services/contentService';
import { ConceptRenderer } from './ConceptRenderer';

export function LessonContentRenderer({ lessonId }: { lessonId: string }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    hydrateRemote()
      .then(() => { if (on) setReady(true); })
      .catch(() => { if (on) { setError('Could not load published content.'); setReady(true); } });
    return () => { on = false; };
  }, []);

  const data = useMemo(() => {
    if (!ready) return null;
    return { concepts: getConceptsForLesson(lessonId), assessments: getAssessmentsForLesson(lessonId) };
  }, [ready, lessonId]);

  if (!ready) return <div className="skel" style={{ height: 140 }} aria-busy="true" />;
  if (error) return <div className="state-error" role="alert"><span>{error}</span></div>;
  if (!data || (data.concepts.length === 0 && data.assessments.length === 0)) return null;

  return (
    <div className="block-stack">
      {data.concepts.map(c => <ConceptRenderer key={c.id} concept={c} />)}
      {data.assessments.map(a => <AssessmentRunner key={a.id} assessment={a} />)}
    </div>
  );
}
