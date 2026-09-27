import { KnowledgeGraph } from '../components/dashboard3/KnowledgeGraph';
import '../components/dashboard3/knowledgegraph.css';
import { SectionIndex, StatementHeader } from '../components/ui/primitives';

export default function GraphPage() {
  return (
    <>
      <SectionIndex index="01" label="Knowledge Graph" />
      <StatementHeader lead="How your concepts connect —" emphasis="prerequisites, dependencies and mastery in one map." />
      <KnowledgeGraph />
    </>
  );
}
