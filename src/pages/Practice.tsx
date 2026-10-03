import { useMemo, useState } from 'react';
import { AssessmentRunner } from '../components/assessment/AssessmentRunner';
import { ConceptRevisionSession } from '../components/revision/ConceptRevisionSession';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { ProblemTracker } from '../components/practice/ProblemTracker';
import { SegmentedTabs } from '../components/ui/primitives';
import { getAllAssessments } from '../services/assessmentService';
import { getPracticeBank } from '../services/practiceService';
import { getRevisionDue } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import type { Difficulty } from '../types';
import '../styles/practice5.css';

type Mode = 'knowledge' | 'assessments' | 'revision';
type KnowledgeView = 'questions' | 'tracker';
type DiffFilter = 'all' | Difficulty;

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

export default function Practice() {
  const { stats } = usePlayer();
  const [mode, setMode] = useState<Mode>('knowledge');
  const [view, setView] = useState<KnowledgeView>('questions');
  const [diff, setDiff] = useState<DiffFilter>('all');
  const [session, setSession] = useState(0);

  const bankSize = useMemo(() => getPracticeBank().length, []);
  const pool = useMemo(() => getPracticeBank(diff === 'all' ? undefined : diff), [diff]);
  const revision = useMemo(() => getRevisionDue(stats), [stats]);
  const assessments = useMemo(() => getAllAssessments(), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header className="ui-statement">
        <h1 className="ui-h1">Practice</h1>
        <p className="ui-desc" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="chip">{bankSize} questions</span>
          <span className="chip">{assessments.length} assessments</span>
          <span className="chip">{revision.length} due</span>
        </p>
      </header>

      <SegmentedTabs
        ariaLabel="Practice mode"
        value={mode}
        onChange={v => setMode(v as Mode)}
        options={[
          { value: 'knowledge', label: 'Knowledge' },
          { value: 'assessments', label: 'Assessments' },
          { value: 'revision', label: 'Revision' },
        ]}
      />

      {mode === 'knowledge' && (
        <>
          <div className="chip-row" role="group" aria-label="Difficulty filter">
            {(['all', 'EASY', 'MEDIUM', 'HARD'] as DiffFilter[]).map(d => (
              <button key={d} type="button" className="chip-btn" aria-pressed={diff === d}
                onClick={() => { setDiff(d); setSession(s => s + 1); }}>
                {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <SegmentedTabs
            ariaLabel="Knowledge view"
            value={view}
            onChange={v => setView(v as KnowledgeView)}
            options={[{ value: 'questions', label: 'Questions' }, { value: 'tracker', label: 'Problem tracker' }]}
          />
          {view === 'questions'
            ? (pool.length === 0
              ? <div className="dempty">No published questions at this difficulty yet.</div>
              : <PracticeEngine key={`${diff}-${session}`} questions={pool as any} title="Knowledge practice" />)
            : <ProblemTracker />}
        </>
      )}

      {mode === 'assessments' && (
        assessments.length === 0
          ? <div className="dempty">No published assessments yet. They appear here once authored and published.</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{assessments.map(a => <AssessmentRunner key={a.id} assessment={a} />)}</div>
      )}

      {mode === 'revision' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ConceptRevisionSession />
          {revision.length === 0 ? (
            <div className="dempty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <span style={{ color: 'var(--text-3)' }}><ClockIcon /></span>
              <span>Nothing is due for revision yet.</span>
              <button type="button" className="btn btn-primary" onClick={() => setMode('knowledge')}>
                Answer 5 questions to start building your revision list
              </button>
            </div>
          ) : (
            <div className="ui-panel">
              {revision.map(r => (
                <Link key={`${r.kind}-${r.id}`} className="v3-qa" to={r.kind === 'lesson' ? `/learn/lesson/${r.id}` : `/practice/problems/${r.id}`}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="v3-insight-title">{r.title}</span>
                    <span className="ui-mono ui-muted" style={{ display: 'block' }}>
                      {r.kind === 'lesson' ? `Due · ${r.days} days since completion` : 'Flagged for revision'}
                    </span>
                  </span>
                  <span className="chip">{r.kind === 'lesson' ? 'Lesson' : 'Problem'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
