import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AssessmentRunner } from '../components/assessment/AssessmentRunner';
import { ConceptRevisionSession } from '../components/revision/ConceptRevisionSession';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { ProblemTracker } from '../components/practice/ProblemTracker';
import { EmptyState, SectionIndex, SegmentedTabs, StatementHeader } from '../components/ui/primitives';
import { getAllAssessments } from '../services/assessmentService';
import { getPracticeBank } from '../services/practiceService';
import { getRevisionDue } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import type { Difficulty } from '../types';

type Mode = 'knowledge' | 'assessments' | 'coding' | 'revision';
type KnowledgeView = 'questions' | 'tracker';

export default function Practice() {
  const { stats } = usePlayer();
  const [mode, setMode] = useState<Mode>('knowledge');
  const [view, setView] = useState<KnowledgeView>('questions');
  const [diff, setDiff] = useState<Difficulty>('EASY');
  const [session, setSession] = useState(0);

  const bankSize = useMemo(() => getPracticeBank().length, []);
  const pool = useMemo(() => getPracticeBank(diff), [diff]);
  const revision = useMemo(() => getRevisionDue(stats), [stats]);
  const assessments = useMemo(() => getAllAssessments(), []);

  return (
    <>
      <StatementHeader
        lead="Deliberate practice —"
        emphasis={`${bankSize} questions · ${assessments.length} assessments · ${revision.length} due`}
      />

      <SegmentedTabs
        ariaLabel="Practice mode"
        value={mode}
        onChange={v => setMode(v as Mode)}
        options={[
          { value: 'knowledge', label: 'Knowledge' },
          { value: 'assessments', label: 'Assessments' },
          { value: 'coding', label: 'Coding' },
          { value: 'revision', label: 'Revision' },
        ]}
      />

      {mode === 'knowledge' && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <SegmentedTabs
              ariaLabel="Knowledge view"
              value={view}
              onChange={v => setView(v as KnowledgeView)}
              options={[{ value: 'questions', label: 'Questions' }, { value: 'tracker', label: 'Problem Tracker' }]}
            />
            {view === 'questions' && (
              <SegmentedTabs
                ariaLabel="Difficulty"
                value={diff}
                onChange={v => { setDiff(v as Difficulty); setSession(s => s + 1); }}
                options={[{ value: 'EASY', label: 'Easy' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HARD', label: 'Hard' }]}
              />
            )}
          </div>
          {view === 'questions'
            ? (pool.length === 0
              ? <EmptyState>No published questions at this difficulty yet.</EmptyState>
              : <PracticeEngine key={`${diff}-${session}`} questions={pool as any} title={`${diff} knowledge practice`} />)
            : <ProblemTracker />}
        </>
      )}

      {mode === 'assessments' && (
        <>
          <SectionIndex index="01" label="Published assessments" />
          {assessments.length === 0
            ? <EmptyState>No published assessments yet. They appear here once authored and published in the Content Studio.</EmptyState>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{assessments.map(a => <AssessmentRunner key={a.id} assessment={a} />)}</div>}
        </>
      )}

      {mode === 'coding' && (
        <>
          <SectionIndex index="01" label="Coding practice" />
          <EmptyState>Code execution is not available yet. Coding tasks will appear here when the execution environment ships — no simulated runner is provided.</EmptyState>
        </>
      )}

      {mode === 'revision' && (
        <>
          <SectionIndex index="01" label="Concept revision" />
          <ConceptRevisionSession />
          <SectionIndex index="02" label="Lesson & problem revision" />
          {revision.length === 0
            ? <EmptyState>Nothing is due for revision yet.</EmptyState>
            : (
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
        </>
      )}
    </>
  );
}
