import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConceptFacets } from './ConceptFacets';
import {
  getConceptsForLesson, getExamples, getMasteryCriteria, getPractice, getRevisions, getVisuals,
} from '../../services/contentService';
import { hydrateRemote } from '../../services/contentRepo';

export function PublishedConcepts({ lessonId }: { lessonId: string }) {
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
    return getConceptsForLesson(lessonId).map(c => ({
      concept: c,
      examples: getExamples(c.id),
      visuals: getVisuals(c.id),
      practice: getPractice(c.id),
      revisions: getRevisions(c.id),
      mastery: getMasteryCriteria(c.id),
    }));
  }, [ready, lessonId]);

  if (!ready) return <div className="skel" style={{ height: 120 }} aria-busy="true" />;
  if (error) return <div className="state-error" role="alert"><span>{error}</span></div>;
  if (!data || data.length === 0) return null;

  return (
    <section className="block-stack" aria-label="Published concepts for this lesson">
      {data.map(({ concept, examples, visuals, practice, revisions, mastery }) => (
        <div key={concept.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ConceptFacets concept={concept} />

          {examples.length > 0 && (
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Examples</div>
              {examples.map(e => (
                <div key={e.id} style={{ marginBottom: 8 }}>
                  <div className="t-body" style={{ color: 'var(--text-primary)' }}>{e.title}</div>
                  <p className="t-body-sm">{e.body}</p>
                  {e.code && <div className="code-block"><pre>{e.code}</pre></div>}
                </div>
              ))}
            </div>
          )}

          {visuals.length > 0 && (
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Visualizations</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {visuals.map(v => (
                  <Link key={v.id} className="chip chip-info" to={`/explore/viz/${v.visualizationId}`}>
                    {v.caption || v.visualizationId}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {practice.length > 0 && (
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Concept practice</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {practice.map(p => (
                  <li key={p.id} className="t-body-sm">
                    <span className="chip" style={{ marginRight: 6 }}>{p.difficulty}</span>{p.prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {revisions.length > 0 && (
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Revision</div>
              {revisions.map(r => (
                <p key={r.id} className="t-body-sm">Every {r.intervalDays} days: {r.prompt}</p>
              ))}
            </div>
          )}

          {mastery && (
            <div>
              <div className="label-mono" style={{ marginBottom: 6 }}>Mastery criteria</div>
              <p className="t-body-sm">
                {mastery.description} (≥{mastery.minAccuracy}% accuracy, {mastery.minApplications} applications
                {mastery.requiresRevision ? ', includes revision' : ''})
              </p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
