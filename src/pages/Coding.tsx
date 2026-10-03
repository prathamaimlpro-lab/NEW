import { useMemo, useState } from 'react';
import { CodeEditor } from '../components/coding/CodeEditor';
import { codingTasks, getCodingTasks, type CodingTask } from '../data/codingTasks';
import { runCodingTask, type RunResult } from '../services/codeRunner';
import { getCodingRecord, recordRun, useCodingProgress } from '../services/codingService';
import '../styles/coding.css';
import '../styles/coding2.css';

type Diff = 'all' | 'EASY' | 'MEDIUM' | 'HARD';

export default function Coding() {
  const { solvedCount } = useCodingProgress();
  const [diff, setDiff] = useState<Diff>('all');
  const [query, setQuery] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [codeByTask, setCodeByTask] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);

  const filtered = useMemo(() => {
    const base = getCodingTasks(diff);
    const q = query.trim().toLowerCase();
    return q ? base.filter(t => t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q)) : base;
  }, [diff, query]);

  const task: CodingTask | undefined = filtered.find(t => t.id === taskId) ?? filtered[0];
  const code = task ? (codeByTask[task.id] ?? task.starterCode) : '';
  const record = task ? getCodingRecord(task.id) : null;

  const run = async () => {
    if (!task) return;
    setRunning(true);
    setResult(null);
    const r = await runCodingTask(task, code);
    recordRun(task.id, r.ok);
    setResult(r);
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header className="ui-statement">
        <h1 className="ui-h1">Coding</h1>
        <p className="ui-desc">Write real JavaScript, run it in your browser, pass the tests. {solvedCount} of {codingTasks.length} solved.</p>
      </header>

      <div className="cg-layout">
        <aside className="cg-list" aria-label="Problem list">
          <label>
            <span className="sr-only">Search problems</span>
            <input className="cg-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search problems or topics" />
          </label>
          <div className="chip-row" role="group" aria-label="Difficulty filter">
            {(['all', 'EASY', 'MEDIUM', 'HARD'] as Diff[]).map(d => (
              <button key={d} type="button" className="chip-btn" aria-pressed={diff === d} onClick={() => { setDiff(d); setTaskId(null); setResult(null); }}>
                {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          {filtered.length === 0 && <div className="dempty">No problems match.</div>}
          {filtered.map(t => {
            const rec = getCodingRecord(t.id);
            return (
              <button key={t.id} type="button" className={`cg-row ${task?.id === t.id ? 'on' : ''}`} onClick={() => { setTaskId(t.id); setResult(null); setHintsOpen(false); }}>
                <span className="cg-row-title">{rec.solved ? '✓ ' : ''}{t.title}</span>
                <span className={`chip ${t.difficulty === 'HARD' ? 'chip-error' : t.difficulty === 'MEDIUM' ? 'chip-warning' : 'chip-success'}`}>
                  {t.difficulty.charAt(0) + t.difficulty.slice(1).toLowerCase()}
                </span>
              </button>
            );
          })}
        </aside>

        <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {task ? (
            <>
              <section className="ui-panel" aria-label={task.title}>
                <div className="ui-panel-head">
                  <div>
                    <h2 className="ui-h2">{task.title}</h2>
                    <p className="ui-question">World {task.worldNumber} · {task.topic}</p>
                  </div>
                  {record && record.attempts > 0 && <span className="ui-mono">{record.attempts} run{record.attempts === 1 ? '' : 's'}</span>}
                </div>
                <p className="t-body-sm" style={{ color: 'var(--text-2)' }}>{task.prompt}</p>
                <CodeEditor value={code} onChange={v => setCodeByTask(prev => ({ ...prev, [task.id]: v }))} ariaLabel={`Code editor for ${task.title}`} />
                <div className="cd-actions">
                  <button type="button" className="btn btn-primary" onClick={run} disabled={running}>{running ? 'Running…' : 'Run tests'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setCodeByTask(prev => ({ ...prev, [task.id]: task.starterCode })); setResult(null); }}>Reset code</button>
                  <button type="button" className="btn btn-ghost" aria-expanded={hintsOpen} onClick={() => setHintsOpen(v => !v)}>{hintsOpen ? 'Hide hints' : 'Show hints'}</button>
                </div>
                {hintsOpen && (
                  <div className="cd-hints">{task.hints.map((h, i) => <span key={i}>{i + 1}. {h}</span>)}</div>
                )}
              </section>

              {result && (
                <section className="cd-results" aria-live="polite" aria-label="Test results">
                  {result.error
                    ? <div className="cd-error">{result.error}</div>
                    : (
                      <>
                        <div className="cd-summary">
                          {result.passed}/{result.total} tests passed · {result.ms} ms
                          {result.ok && <span className="chip chip-success" style={{ marginLeft: 8 }}>Solved</span>}
                        </div>
                        {result.cases.map(c => (
                          <div key={c.name} className="cd-case">
                            <span className={c.ok ? 'cd-case-ok' : 'cd-case-bad'} aria-hidden="true">{c.ok ? '✓' : '✕'}</span>
                            <span>{c.name}{!c.ok && <span className="cd-case-detail">{c.detail}</span>}</span>
                          </div>
                        ))}
                      </>
                    )}
                </section>
              )}
            </>
          ) : (
            <div className="dempty">No coding tasks published yet.</div>
          )}
        </main>

        <aside className="cg-meta" aria-label="Problem details">
          {task && (
            <>
              <div className="ui-pod">
                <span className="ui-index">Topics</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="chip2">{task.topic}</span>
                  <span className="chip2">World {task.worldNumber}</span>
                </div>
              </div>
              <div className="ui-pod">
                <span className="ui-index">Tests</span>
                <span className="ui-mono" style={{ color: 'var(--text)' }}>{task.tests.length} cases</span>
                <span className="ui-mono ui-muted">Runs locally in your browser — your code never leaves this device.</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
