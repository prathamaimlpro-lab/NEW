import { Link } from 'react-router-dom';
import { EmptyState, SectionIndex, StatementHeader } from '../components/ui/primitives';

export default function BooksPage() {
  return (
    <>
      <SectionIndex index="01" label="Books" />
      <StatementHeader lead="Technical library —" emphasis="in development." />
      <EmptyState
        action={<Link className="btn btn-secondary btn-sm" to="/learn">Browse curriculum</Link>}
      >
        No books published yet. The library will surface curated technical texts linked to your curriculum once authored — nothing here is simulated.
      </EmptyState>
    </>
  );
}
