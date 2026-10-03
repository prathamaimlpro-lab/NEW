import { useMemo, useState } from 'react';
import { getCodingTasks, type CodingTask } from '../../data/codingTasks';
import { runCodingTask, type RunResult } from '../../services/codeRunner';
import { getCodingRecord, recordRun, useCodingProgress } from '../../services/codingService';
import '../../../styles/coding.css';

type Diff = 'all' | 'EASY' | 'MEDIUM' | 'HARD';

export function CodingPractice() {
  const { solvedCount } = useCodingProgress();
  const [diff, setDiff] = useState<Diff>('all');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [codeByTask, setCodeByTask] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);

  const tasks = useMemo(() => getCodingTasks(diff), [diff]);
  const task: CodingTask | undefined = tasks.find(t => t.id === taskId) ?? tasks[0];
  const code = task ? (codeByTask[task.id] ?? task.starterCode) : '';
  const record = task ? getCodingRecord(task.id) : null;

  if (tasks.length === 0) {
    return <div className="dempty">No coding tasks at this difficulty yet.</div>;
  }

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
    <div className="cd-wrap">
      <div className="chip-row" role="group" aria-label="Difficulty filter">
        {(['all', 'EASY', 'MEDIUM', 'HARD'] as Diff[]).map(d => (
          <button key={d} type="button" className="chip-btn" aria-pressed={diff === d} onClick={() => { setDiff(d); setTaskId(null); setResult(null); setHintsOpen(false); }}>
            {d === 'all' ? `All · ${solvedCount} solved` : d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="cd-tasks" role="list" aria-label="Coding tasks">
        {tasks.map(t => {
          const rec = getCodingRecord(t.id);
          return (
            <button key={t.id} role="listitem" type="button" className={`cd-task ${task?.id === t.id ? 'on' : ''}`}
              onClick={() => { setTaskId(t.id); setResult(null); setHintsOpen(false); }}>
              <span className="cd-task-title">{t.title}</span>
              <span className="cd-task-meta">
                {rec.solved && <span className="chip chip-success">Solved</span>}
                <span className={`chip ${t.difficulty === 'HARD' ? 'chip-error' : t.difficulty === 'MEDIUM' ? 'chip-warning' : 'chip-success'}`}>
                  {t.difficulty.charAt(0) + t.difficulty.slice(1).toLowerCase()}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {task && (
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

            <label className="ui-index" htmlFor="cd-code">Your code — define {task.fnName}</label>
            <textarea
              id="cd-code"
              className="cd-editor"
              value={code}
              spellCheck={false}
              aria-label={`Code editor for ${task.title}`}
              onChange={e => setCodeByTask(prev => ({ ...prev, [task.id]: e.target.value }))}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const el = e.currentTarget;
                  const s = el.selectionStart;
                  const next = code.slice(0, s) + '  ' + code.slice(el.selectionEnd);
                  setCodeByTask(prev => ({ ...prev, [task.id]: next }));
                  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
                }
              }}
            />

            <div className="cd-actions">
              <button type="button" className="btn btn-primary" onClick={run} disabled={running}>
                {running ? 'Running…' : 'Run tests'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setCodeByTask(prev => ({ ...prev, [task.id]: task.starterCode })); setResult(null); }}>
                Reset code
              </button>
              <button type="button" className="btn btn-ghost" aria-expanded={hintsOpen} onClick={() => setHintsOpen(v => !v)}>
                {hintsOpen ? 'Hide hints' : 'Show hints'}
              </button>
            </div>

            {hintsOpen && (
              <div className="cd-hints">
                {task.hints.map((h, i) => <span key={i}>{i + 1}. {h}</span>)}
              </div>
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
                        <span>
                          {c.name}
                          {!c.ok && <span className="cd-case-detail">{c.detail}</span>}
                        </span>
                      </div>
                    ))}
                  </>
                )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
