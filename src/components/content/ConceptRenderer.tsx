import { memo } from 'react';
import type { Concept } from '../../content/types';
import {
  getExamples, getMasteryCriteria, getPractice, getProjects, getRevisions, getVisuals,
} from '../../services/contentService';
import {
  CrossReferenceRenderer, ExampleRenderer, ExplanationRenderer, MasteryCriteriaRenderer,
  PracticeRenderer, ProjectRenderer, RevisionRenderer, VisualRenderer,
} from './renderers';

export const ConceptRenderer = memo(function ConceptRenderer({ concept }: { concept: Concept }) {
  const examples = getExamples(concept.id);
  const visuals = getVisuals(concept.id);
  const practice = getPractice(concept.id);
  const revisions = getRevisions(concept.id);
  const projects = getProjects(concept.id);
  const mastery = getMasteryCriteria(concept.id);

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-labelledby={`concept-${concept.id}`}>
      <h3 id={`concept-${concept.id}`} className="t-hmd">{concept.title}</h3>
      <ExplanationRenderer facets={concept.facets} />
      <ExampleRenderer examples={examples} />
      <VisualRenderer visuals={visuals} />
      <PracticeRenderer questions={practice} title="Concept practice" />
      <ProjectRenderer projects={projects} />
      <RevisionRenderer revisions={revisions} />
      <MasteryCriteriaRenderer criteria={mastery} />
      <CrossReferenceRenderer concept={concept} />
    </article>
  );
});
