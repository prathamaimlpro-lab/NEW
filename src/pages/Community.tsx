import { Link } from 'react-router-dom';
import { EmptyState, SectionIndex, StatementHeader } from '../components/ui/primitives';

export default function CommunityPage() {
  return (
    <>
      <SectionIndex index="01" label="Community" />
      <StatementHeader lead="Learner community —" emphasis="in development." />
      <EmptyState
        action={<Link className="btn btn-secondary btn-sm" to="/practice">Go to Practice</Link>}
      >
        Community features are not live yet. When shipped, this space will host discussion tied to real lessons and projects — no placeholder content.
      </EmptyState>
    </>
  );
}
