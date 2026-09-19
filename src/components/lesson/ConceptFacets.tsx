import type { Concept } from '../../content/types';
import { ExplanationRenderer } from '../content/renderers';

export function ConceptFacets({ concept }: { concept: Concept }) {
  if (!concept || !concept.facets || concept.facets.length === 0) return null;
  return (
    <section className="block-stack" aria-label={concept.title}>
      <h3 className="t-hmd">{concept.title}</h3>
      <ExplanationRenderer facets={concept.facets} />
    </section>
  );
}
