import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { ProblemTracker } from '../components/practice/ProblemTracker';
import { lessons } from '../data/curriculum';
import { getRevisionDue } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import type { Difficulty } from '../types';

type Mode = 'knowledge' | 'coding' | 'review';
type KnowledgeView = 'questions' | 'tracker';

export default function Practice() {
  const { stats } = usePlayer();
  const [mode, setMode] = useState<Mode>('knowledge');
  const [view, setView] = useState<KnowledgeView>('questions');
  const [diff, setDiff] = useState<Difficulty>('EASY');
  const [session, setSession] = useState(0);

  const allQuestions = useMemo(() => Object.values(lessons).filter(l => l.status === 'PUBLISHED').flatMap(l => l.practice), []);
  const pool = useMemo(() => allQuestions.filter(q => q.difficulty === diff), [allQuestions, diff]);
  const revision = useMemo(() => getRevisionDue(stats), [stats]);

  return (
    <>
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>Practice</div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>Choose your practice mode</h1>
        <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
          Knowledge Practice tests concepts with questions. Coding Practice will host real programming tasks once an execution environment ships. Review resurfaces material due for revision.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <button type="button" className="card card-interactive" onClick={() => setMode('knowledge')} aria-pressed={mode === 'knowledge'}>
          <div className="d-title" style={{ fontSize: 16 }}>Knowledge Practice</div>
          <div className="d-micro" style={{ marginTop: 6 }}>{allQuestions.length} concept questions · MCQ & reasoning</div>
          <span className="chip chip-success" style={{ marginTop: 10 }}>Available</span>
        </button>
        <button type="button" className="card card-interactive" onClick={() => setMode('coding')} aria-pressed={mode === 'coding'}>
          <div className="d-title" style={{ fontSize: 16 }}>Coding Practice</div>
          <div className="d-micro" style={{ marginTop: 6 }}>Write-and-run programming tasks</div>
          <span className="chip chip-warning" style={{ marginTop: 10 }}>Coming soon</span>
        </button>
        <button type="button" className="card card-interactive" onClick={() => setMode('review')} aria-pressed={mode === 'review'}>
          <div className="d-title" style={{ fontSize: 16 }}>Review / Revision</div>
          <div className="d-micro" style={{ marginTop: 6 }}>{revision.length} item{revision.length === 1 ? '' : 's'} due</div>
          <span className={`chip ${revision.length > 0 ? 'chip-info' : ''}`} style={{ marginTop: 10 }}>{revision.length > 0 ? 'Available' : 'Empty'}</span>
        </button>
      </section>

      {mode === 'knowledge' && (
        <>
          <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className={`btn btn-sm ${view === 'questions' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('questions')} aria-pressed={view === 'questions'}>Questions</button>
            <button type="button" className={`btn btn-sm ${view === 'tracker' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setView('tracker')} aria-pressed={view === 'tracker'}>Problem Tracker</button>
          </section>
          {view === 'questions' ? (
            <>
              <section style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                  <button key={d} type="button" className={`btn btn-sm ${diff === d ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => { setDiff(d); setSession(s => s + 1); }} aria-pressed={diff === d}>{d}</button>
                ))}
              </section>
              {pool.length === 0
                ? <div className="dempty">No questions at this difficulty yet.</div>
                : <PracticeEngine key={`${diff}-${session}`} questions={pool} title={`${d(diff)} knowledge practice`} />}
            </>
          ) : <ProblemTracker />}
        </>
      )}

      {mode === 'coding' && (
        <section className="p-chart">
          <div className="p-head">
            <span className="d-eyebrow">Coding Practice</span>
            <span className="chip chip-warning">Coming soon</span>
          </div>
          <div className="dempty">
            Code execution is not available yet. Coding tasks will appear here when the execution environment ships — no simulated runner is provided.
          </div>
          <p className="d-micro" style={{ marginTop: 10, color: 'var(--text-muted, #64748B)' }}>
            Meanwhile, Knowledge Practice covers concept-level reasoning for the same topics.
          </p>
        </section>
      )}

      {mode === 'review' && (
        <section className="p-list">
          <div className="p-head"><span className="d-eyebrow">Review / Revision</span></div>
          {revision.length === 0 ? (
            <div className="dempty">Nothing is due for revision yet. Completed lessons return here after 7 days, and problems you flag for review appear here.</div>
          ) : revision.map(r => (
            <Link key={`${r.kind}-${r.id}`} className="lrow" to={r.kind === 'lesson' ? `/learn/lesson/${r.id}` : `/practice/problems/${r.id}`}>
              <span className="rail"><span className="dot" style={{ background: 'var(--signal-weak, #F59E0B)' }} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>{r.title}</span>
                <span className="d-micro" style={{ color: 'var(--text-muted, #64748B)' }}>
                  {r.kind === 'lesson' ? `Revision due · ${r.days}d since completion` : 'Flagged for review'}
                </span>
              </span>
              <span className="chip">{r.kind}</span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}

function d(diff: Difficulty): string {
  return diff.charAt(0) + diff.slice(1).toLowerCase();
}
