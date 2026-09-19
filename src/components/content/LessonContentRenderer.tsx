import { useEffect, useMemo, useState } from 'react';
import type { Assessment } from '../../content/types';
import { hydrateRemote } from '../../services/contentRepo';
import { getConceptsForLesson, listAll } from '../../services/contentService';
import { ConceptRenderer } from './ConceptRenderer';
import { AssessmentRenderer } from './renderers';

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
    const concepts = getConceptsForLesson(lessonId);
    const assessment = listAll('assessments').find(a => a.lessonId === lessonId && a.status === 'PUBLISHED') as Assessment | undefined;
    return { concepts, assessment };
  }, [ready, lessonId]);

  if (!ready) return <div className="skel" style={{ height: 140 }} aria-busy="true" />;
  if (error) return <div className="state-error" role="alert"><span>{error}</span></div>;
  if (!data || (data.concepts.length === 0 && !data.assessment)) return null;

  return (
    <div className="block-stack">
      {data.concepts.map(c => <ConceptRenderer key={c.id} concept={c} />)}
      <AssessmentRenderer assessment={data.assessment} />
    </div>
  );
}
