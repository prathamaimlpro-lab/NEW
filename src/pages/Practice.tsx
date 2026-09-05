import { useMemo, useState } from 'react';
import { ProblemTracker } from '../components/practice/ProblemTracker';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { StatisticsPanel } from '../components/practice/StatisticsPanel';
import { EmptyState } from '../components/common/ui';
import { lessons } from '../data/curriculum';
import { Difficulty } from '../types';

const DIFFS: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

export default function Practice() {
  const [tab, setTab] = useState<'tracker' | 'coding' | 'stats'>('tracker');
  const [diff, setDiff] = useState<Difficulty>('EASY');
  const [session, setSession] = useState(0);

  const pool = useMemo(() => Object.values(lessons).filter(l => l.status === 'PUBLISHED').flatMap(l => l.practice).filter(q => q.difficulty === diff), [diff]);

  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>PRACTICE RANGE</div>
        <h1 className="t-hlg" style={{ marginBottom: 8 }}>Deliberate Repetition</h1>
        <p className="t-body-lg" style={{ maxWidth: 640 }}>Track problems, practice lesson concepts, and watch real statistics accumulate.</p>
      </section>
      <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('tracker')} aria-pressed={tab === 'tracker'}>Problem Tracker</button>
        <button className={`btn ${tab === 'coding' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('coding')} aria-pressed={tab === 'coding'}>Coding Practice</button>
        <button className={`btn ${tab === 'stats' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('stats')} aria-pressed={tab === 'stats'}>Statistics</button>
      </section>

      {tab === 'tracker' && <ProblemTracker />}
      {tab === 'stats' && <StatisticsPanel />}
      {tab === 'coding' && (
        <>
          <section style={{ display: 'flex', gap: 8 }}>
            {DIFFS.map(d => (
              <button key={d} className={`btn ${diff === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setDiff(d); setSession(s => s + 1); }} aria-pressed={diff === d}>{d}</button>
            ))}
          </section>
          {pool.length === 0
            ? <EmptyState icon="practice" title="No questions at this difficulty yet" message="Questions for this difficulty are being authored for upcoming lessons." />
            : <PracticeEngine key={`${diff}-${session}`} questions={pool} title={`${diff} practice`} />}
        </>
      )}
    </>
  );
}
