import { memo, useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import type {
  Assessment, Concept, ConceptFacet, Example, MasteryCriteria, PracticeQuestion, Project, Revision, Visual,
} from '../../content/types';
import { getConcept, listAll } from '../../services/contentService';
import { listVisualizations } from '../visualization/registry';
import { PracticeEngine } from '../practice/PracticeEngine';

const facetLabel = (k: ConceptFacet['key']) => (k === 'REAL_WORLD' ? 'REAL WORLD' : k);

/* Adapt content-model questions to the existing PracticeEngine question shape. */
const toEngine = (p: PracticeQuestion): any => ({
  id: p.id, difficulty: p.difficulty, question: p.prompt, prompt: p.prompt,
  options: p.options, answerIndex: p.answerIndex, correctIndex: p.answerIndex, correct: p.answerIndex,
  explanation: p.explanation, xp: 10,
});

export const ExplanationRenderer = memo(function ExplanationRenderer({ facets }: { facets: ConceptFacet[] }) {
  if (!facets || facets.length === 0) return null;
  return (
    <div className="block-stack" style={{ gap: 12 }}>
      {facets.map((f, i) => (
        <section key={`${f.key}-${i}`}>
          <h4 className="label-mono" style={{ marginBottom: 6 }}>{facetLabel(f.key)}</h4>
          {f.body && <p className="t-body">{f.body}</p>}
          {f.bullets && f.bullets.length > 0 && (
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {f.bullets.map(b => <li key={b} className="t-body">{b}</li>)}
            </ul>
          )}
          {f.code && <div className="code-block" style={{ marginTop: 8 }}><pre>{f.code}</pre></div>}
        </section>
      ))}
    </div>
  );
});

export const ExampleRenderer = memo(function ExampleRenderer({ examples }: { examples: Example[] }) {
  if (!examples || examples.length === 0) return null;
  return (
    <section aria-label="Examples">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Examples</h4>
      <div className="block-stack" style={{ gap: 10 }}>
        {examples.map(e => (
          <article key={e.id}>
            <div className="t-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.title}</div>
            <p className="t-body-sm" style={{ marginTop: 4 }}>{e.body}</p>
            {e.code && <div className="code-block" style={{ marginTop: 6 }}><pre>{e.code}</pre></div>}
          </article>
        ))}
      </div>
    </section>
  );
});

export const VisualRenderer = memo(function VisualRenderer({ visuals }: { visuals: Visual[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!visuals || visuals.length === 0) return null;
  const map = new Map(listVisualizations().map(v => [v.id, v as any]));
  return (
    <section aria-label="Visualizations">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Visualizations</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visuals.map(v => {
          const viz = map.get(v.visualizationId);
          if (!viz) {
            return (
              <p key={v.id} className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
                Visualization “{v.visualizationId}” is not available yet.
              </p>
            );
          }
          const Comp = viz.component ?? viz.Component;
          return (
            <article key={v.id} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="t-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{viz.title}</span>
                <span className="chip">{viz.category}</span>
              </div>
              {v.caption && <p className="t-body-sm">{v.caption}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link className="btn btn-secondary btn-sm" to={`/explore/viz/${viz.id}`}>Open in Visualization Lab</Link>
                {typeof Comp === 'function' && (
                  <button type="button" className="btn btn-ghost btn-sm" aria-expanded={openId === v.id}
                    onClick={() => setOpenId(openId === v.id ? null : v.id)}>
                    {openId === v.id ? 'Hide inline preview' : 'Preview inline'}
                  </button>
                )}
              </div>
              {openId === v.id && typeof Comp === 'function' && (
                <Suspense fallback={<div className="skel" style={{ height: 200 }} aria-busy="true" />}>
                  <Comp />
                </Suspense>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
});

export const PracticeRenderer = memo(function PracticeRenderer({ questions, title }: { questions: PracticeQuestion[]; title: string }) {
  if (!questions || questions.length === 0) return null;
  return (
    <section aria-label={title}>
      <h4 className="label-mono" style={{ marginBottom: 6 }}>{title}</h4>
      <PracticeEngine questions={questions.map(toEngine)} title={title} />
    </section>
  );
});

export const ProjectRenderer = memo(function ProjectRenderer({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;
  return (
    <section aria-label="Projects">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Projects</h4>
      <div className="block-stack" style={{ gap: 10 }}>
        {projects.map(p => (
          <article key={p.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <span className="t-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</span>
              <span className="chip">+{p.xp} XP</span>
            </div>
            <p className="t-body-sm" style={{ marginTop: 4 }}>{p.summary}</p>
            {p.requirements && p.requirements.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {p.requirements.map(r => <li key={r} className="t-body-sm">{r}</li>)}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
});

export const RevisionRenderer = memo(function RevisionRenderer({ revisions }: { revisions: Revision[] }) {
  if (!revisions || revisions.length === 0) return null;
  return (
    <section aria-label="Revision">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Revision</h4>
      <div className="block-stack" style={{ gap: 8 }}>
        {revisions.map(r => (
          <article key={r.id}>
            <p className="t-body-sm"><strong>Every {r.intervalDays} days:</strong> {r.prompt}</p>
            <Link className="d-micro" style={{ color: 'var(--action-text)', display: 'inline-block', marginTop: 4 }} to="/practice">Open Revision →</Link>
          </article>
        ))}
      </div>
    </section>
  );
});

export const MasteryCriteriaRenderer = memo(function MasteryCriteriaRenderer({ criteria }: { criteria?: MasteryCriteria }) {
  if (!criteria) return null;
  return (
    <section aria-label="Mastery criteria">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Mastery criteria</h4>
      <p className="t-body-sm">{criteria.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        <span className="chip">≥{criteria.minAccuracy}% accuracy</span>
        <span className="chip">{criteria.minApplications} applications</span>
        {criteria.requiresRevision && <span className="chip">includes revision</span>}
      </div>
    </section>
  );
});

export const CrossReferenceRenderer = memo(function CrossReferenceRenderer({ concept }: { concept: Concept }) {
  const prereqs = concept.prerequisiteConceptIds.map(id => getConcept(id)).filter((c): c is Concept => !!c);
  const dependents = listAll('concepts').filter(c => c.id !== concept.id && c.prerequisiteConceptIds.includes(concept.id));
  const lessons = listAll('lessons').filter(l => l.status === 'PUBLISHED' && l.conceptIds.includes(concept.id));
  if (prereqs.length === 0 && dependents.length === 0 && lessons.length === 0) return null;
  return (
    <section aria-label="Connections">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Connections</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {prereqs.length > 0 && <p className="t-body-sm"><strong>Builds on:</strong> {prereqs.map(p => p.title).join(', ')}</p>}
        {dependents.length > 0 && <p className="t-body-sm"><strong>Unlocks:</strong> {dependents.map(d => d.title).join(', ')}</p>}
        {lessons.length > 0 && (
          <p className="t-body-sm">
            <strong>Appears in:</strong>{' '}
            {lessons.map((l, i) => (
              <span key={l.id}>
                <Link style={{ color: 'var(--action-text)' }} to={`/learn/lesson/${l.id}`}>{l.title}</Link>
                {i < lessons.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  );
});

export const AssessmentRenderer = memo(function AssessmentRenderer({ assessment }: { assessment?: Assessment }) {
  if (!assessment) return null;
  const qs = listAll('practice').filter(p => p.status === 'PUBLISHED' && assessment.questionIds.includes(p.id));
  return (
    <section aria-label="Assessment">
      <h4 className="label-mono" style={{ marginBottom: 6 }}>Assessment · pass ≥{assessment.passThreshold}%</h4>
      {qs.length === 0
        ? <p className="t-body-sm" style={{ color: 'var(--text-muted)' }}>No published assessment questions yet.</p>
        : <PracticeEngine questions={qs.map(toEngine)} title="Assessment" />}
    </section>
  );
});
