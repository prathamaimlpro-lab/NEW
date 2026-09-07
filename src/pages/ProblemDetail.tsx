import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, EmptyState } from '../components/common/ui';
import { getProblem } from '../data/problems';
import { getLevel } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ProblemDetail() {
  const { problemId } = useParams();
  const p = problemId ? getProblem(problemId) : undefined;
  const { stats, solveProblem, toggleFavourite, toggleReview, toggleMastered, setConfidence, setProblemNotes, setScratchCode } = usePlayer();
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  if (!p || p.status !== 'PUBLISHED') return <EmptyState icon="search" title="Problem unavailable" message="This problem does not exist or is not published." action={<Link className="btn btn-primary" to="/practice">Back to Practice</Link>} />;

  const rec = stats.problems[p.id];
  const correct = picked === p.correctAnswer;
  const relLevel = getLevel(p.relatedLevel);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Link to="/practice" className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="arrow-left" size={14} /> Problem Tracker</Link>
      <header>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <Chip tone={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{p.difficulty}</Chip>
          <Chip tone="primary">+{p.xp} XP</Chip>
          <Chip>{p.pattern.toUpperCase()}</Chip>
          {p.topics.map(t => <Chip key={t}>{t.toUpperCase()}</Chip>)}
          {rec?.solved && <Chip tone="success" icon="check">SOLVED {rec.solvedDate ? `· ${rec.solvedDate}` : ''}</Chip>}
          {rec?.mastered && <Chip tone="primary" icon="award">MASTERED</Chip>}
        </div>
        <h1 className="t-hlg" style={{ marginBottom: 12 }}>{p.title}</h1>
        <p className="t-body-lg">{p.description}</p>
      </header>

      <div className="grid-2">
        <div className="card" style={{ padding: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>EXAMPLES // TEST CASES</div>
          {p.examples.map((ex, i) => (
            <div key={i} className="code-block" style={{ marginBottom: 8 }}>
              <div className="code-head"><span className="label-mono">case {i + 1}</span></div>
              <pre>{`input : ${ex.input}\noutput: ${ex.output}`}</pre>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>CONSTRAINTS</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.constraints.map(c => <li key={c} className="t-body-sm mono" style={{ color: 'var(--fg-secondary)' }}>· {c}</li>)}
          </ul>
          {relLevel && <Link to={`/learn/level/${relLevel.id}`} className="t-body-sm" style={{ display: 'inline-flex', gap: 6, marginTop: 12, color: '#a5a1ff' }}>Related: Level {relLevel.number} — {relLevel.title} <Icon name="chevron-right" size={12} /></Link>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setHintsShown(h => Math.min(p.hints.length, h + 1))} disabled={hintsShown >= p.hints.length}>Reveal hint ({hintsShown}/{p.hints.length})</button>
        <button className="btn btn-ghost btn-sm" style={rec?.favourite ? { color: 'var(--warning)' } : {}} onClick={() => toggleFavourite(p.id)} aria-pressed={!!rec?.favourite}><Icon name="award" size={14} /> Favourite</button>
        <button className="btn btn-ghost btn-sm" style={rec?.review ? { color: 'var(--warning)' } : {}} onClick={() => toggleReview(p.id)} aria-pressed={!!rec?.review}><Icon name="flag" size={14} /> Needs Review</button>
        <button className="btn btn-ghost btn-sm" style={rec?.mastered ? { color: '#a5a1ff' } : {}} onClick={() => toggleMastered(p.id)} aria-pressed={!!rec?.mastered}><Icon name="shield" size={14} /> Mastered</button>
      </div>
      {p.hints.slice(0, hintsShown).map((h, i) => (
        <div key={i} className="card fade-in" style={{ padding: 12, borderLeft: '2px solid var(--warning)' }}><p className="t-body-sm">Hint {i + 1}: {h}</p></div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {p.options.map((opt, i) => {
          let cls = 'q-option';
          if (revealed) { if (opt === p.correctAnswer) cls += ' correct'; else if (opt === picked) cls += ' wrong'; }
          return <button key={opt} className={cls} disabled={revealed} onClick={() => { setPicked(opt); setRevealed(true); solveProblem(p, opt === p.correctAnswer); }}><span className="letter">{LETTERS[i]}</span><span>{opt}</span></button>;
        })}
      </div>

      {revealed && (
        <div className="card fade-in" style={{ borderColor: correct ? 'rgba(16,185,129,.4)' : 'rgba(239,68,68,.4)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, color: correct ? 'var(--success)' : 'var(--error)' }}>
            <Icon name={correct ? 'check-circle' : 'x'} size={16} /><span className="label-mono" style={{ color: 'inherit' }}>{correct ? `SOLVED · +${p.xp} XP` : 'NOT QUITE'}</span>
          </div>
          <p className="t-body" style={{ marginBottom: 8 }}>{p.explanation}</p>
          <div className="label-mono" style={{ marginBottom: 6 }}>SOLUTION</div>
          <p className="t-body-sm" style={{ color: 'var(--fg-secondary)' }}>{p.solution}</p>
          <div className="label-mono" style={{ margin: '12px 0 6px' }}>CONFIDENCE</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([1, 2, 3] as const).map(v => (
              <button key={v} className={`btn btn-sm ${rec?.confidence === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setConfidence(p.id, v)}>{v === 1 ? 'Low' : v === 2 ? 'Medium' : 'High'}</button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="label-mono" style={{ marginBottom: 8 }}>SCRATCH CODE // SAVED LOCALLY, NOT EXECUTED</div>
        <textarea className="input mono" style={{ height: 140, padding: 12, resize: 'vertical', fontFamily: 'var(--font-mono)' }} placeholder={"// write your approach here\n// real code execution arrives with the future sandbox"} value={rec?.scratchCode ?? ''} onChange={e => setScratchCode(p.id, e.target.value)} aria-label="Scratch code" />
        <div className="label-mono" style={{ margin: '12px 0 8px' }}>NOTES // PRIVATE</div>
        <textarea className="input" style={{ height: 96, padding: 12, resize: 'vertical' }} placeholder="Your approach, edge cases, mistakes…" value={rec?.notes ?? ''} onChange={e => setProblemNotes(p.id, e.target.value)} aria-label="Problem notes" />
      </div>
    </div>
  );
}
