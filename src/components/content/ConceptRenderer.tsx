import { memo } from 'react';
import type { Concept } from '../../content/types';
import { getConceptMastery } from '../../services/conceptMastery';
import {
  getExamples, getMasteryCriteria, getPractice, getProjects, getRevisions, getVisuals,
} from '../../services/contentService';
import { usePlayer } from '../../store/PlayerContext';
import {
  CrossReferenceRenderer, ExampleRenderer, ExplanationRenderer, MasteryCriteriaRenderer,
  PracticeRenderer, ProjectRenderer, RevisionRenderer, VisualRenderer,
} from './renderers';

export const ConceptRenderer = memo(function ConceptRenderer({ concept }: { concept: Concept }) {
  const { stats } = usePlayer();
  const ev = getConceptMastery(stats, concept);
  const examples = getExamples(concept.id);
  const visuals = getVisuals(concept.id);
  const practice = getPractice(concept.id);
  const revisions = getRevisions(concept.id);
  const projects = getProjects(concept.id);
  const mastery = getMasteryCriteria(concept.id);

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-labelledby={`concept-${concept.id}`}>
      <h3 id={`concept-${concept.id}`} className="t-hmd">{concept.title}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="chip">Mastery: {ev.tier}</span>
        <span className="chip">{ev.masteryPct}%</span>
        {ev.lessonCompleted && <span className="chip chip-success">lesson completed</span>}
        {ev.practiceCorrect > 0 && <span className="chip">{ev.practiceCorrect} correct attempt{ev.practiceCorrect === 1 ? '' : 's'}</span>}
      </div>
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
