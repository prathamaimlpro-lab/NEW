import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, EmptyState } from '../components/common/ui';
import { getProblem } from '../data/problems';
import { usePlayer } from '../store/PlayerContext';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ProblemDetail() {
  const { problemId } = useParams();
  const p = problemId ? getProblem(problemId) : undefined;
  const { stats, solveProblem, toggleFavourite, toggleReview, setProblemNotes } = usePlayer();
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);

  if (!p || p.status !== 'PUBLISHED') return <EmptyState icon="search" title="Problem unavailable" message="This problem does not exist or is not published." action={<Link className="btn btn-primary" to="/practice">Back to Practice</Link>} />;

  const rec = stats.problems[p.id];
  const correct = picked === p.correctAnswer;

  return (
    <div className="reading" style={{ maxWidth: 860, margin: '0 auto' }}>
      <Link to="/practice" className="t-body" style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="arrow-left" size={14} /> Problem Tracker</Link>
      <header style={{ margin: '20px 0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <Chip tone={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{p.difficulty}</Chip>
          <Chip tone="primary">+{p.xp} XP</Chip>
          {p.topics.map(t => <Chip key={t}>{t.toUpperCase()}</Chip>)}
          {rec?.solved && <Chip tone="success" icon="check">SOLVED</Chip>}
        </div>
        <h1 className="t-hlg" style={{ marginBottom: 12 }}>{p.title}</h1>
        <p className="t-body-lg">{p.description}</p>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setHintsShown(h => Math.min(p.hints.length, h + 1))} disabled={hintsShown >= p.hints.length}>Reveal hint ({hintsShown}/{p.hints.length})</button>
        <button className="btn btn-ghost btn-sm" style={rec?.favourite ? { color: 'var(--warning)' } : {}} onClick={() => toggleFavourite(p.id)} aria-pressed={!!rec?.favourite}><Icon name="award" size={14} /> Favourite</button>
        <button className="btn btn-ghost btn-sm" style={rec?.review ? { color: 'var(--warning)' } : {}} onClick={() => toggleReview(p.id)} aria-pressed={!!rec?.review}><Icon name="flag" size={14} /> Review</button>
      </div>
      {p.hints.slice(0, hintsShown).map((h, i) => (
        <div key={i} className="card fade-in" style={{ padding: 12, marginBottom: 8, borderLeft: '2px solid var(--warning)' }}><p className="t-body-sm">Hint {i + 1}: {h}</p></div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
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
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="label-mono" style={{ marginBottom: 8 }}>NOTES // PRIVATE</div>
        <textarea className="input" style={{ height: 96, padding: 12, resize: 'vertical' }} placeholder="Your approach, edge cases, mistakes…" value={rec?.notes ?? ''} onChange={e => setProblemNotes(p.id, e.target.value)} aria-label="Problem notes" />
        {p.relatedLessons.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="label-mono">RELATED:</span>
            {p.relatedLessons.map(id => <Link key={id} className="t-body-sm" style={{ color: '#a5a1ff' }} to={`/learn/lesson/${id}`}>{id.replaceAll('-', ' ')}</Link>)}
          </div>
        )}
      </div>
    </div>
  );
}
