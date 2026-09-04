import { useState } from 'react';
import { usePlayer } from '../../store/PlayerContext';
import { Question } from '../../types';
import { Icon } from '../common/Icon';
import { Chip } from '../common/ui';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function PracticeEngine({ questions, onComplete, title = 'Practice' }: {
  questions: Question[]; onComplete?: () => void; title?: string;
}) {
  const { answerQuestion } = usePlayer();
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) return null;
  const q = questions[idx];
  const correct = picked === q.correctAnswer;

  const pick = (opt: string) => {
    if (revealed) return;
    setPicked(opt); setRevealed(true);
    const ok = opt === q.correctAnswer;
    if (ok) { setSessionXp(x => x + q.xp); setSessionCorrect(c => c + 1); }
    answerQuestion(q, ok);
  };

  const next = () => {
    if (idx < questions.length - 1) { setIdx(idx + 1); setRevealed(false); setPicked(null); }
    else { setDone(true); onComplete?.(); }
  };

  if (done) {
    return (
      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--success)' }}><Icon name="check-circle" size={28} /></span>
        <h3 className="t-hsm">{title} complete</h3>
        <p className="t-body">{sessionCorrect} of {questions.length} correct · <span className="mono" style={{ color: '#a5a1ff' }}>+{sessionXp} XP</span></p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <span className="label-mono">QUESTION {String(idx + 1).padStart(2, '0')} OF {String(questions.length).padStart(2, '0')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip tone={q.difficulty === 'EASY' ? 'success' : q.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{q.difficulty}</Chip>
          <Chip tone="primary">+{q.xp} XP</Chip>
        </div>
      </div>
      <h3 className="t-hsm" style={{ marginBottom: 6 }}>{q.question}</h3>
      {q.hint && !revealed && <p className="t-body-sm" style={{ color: 'var(--fg-muted)', marginBottom: 12 }}>{q.hint}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {q.options.map((opt, i) => {
          let cls = 'q-option';
          if (revealed) {
            if (opt === q.correctAnswer) cls += ' correct';
            else if (opt === picked) cls += ' wrong';
          }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)} disabled={revealed}>
              <span className="letter">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="fade-in" style={{ marginTop: 16, background: 'var(--canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: correct ? 'var(--success)' : 'var(--error)' }}>
            <Icon name={correct ? 'check-circle' : 'x'} size={16} />
            <span className="label-mono" style={{ color: 'inherit' }}>{correct ? 'ACCURATE ANALYSIS' : 'MISANALYSIS'}</span>
          </div>
          <p className="t-body" style={{ color: 'var(--fg-secondary)' }}>{q.explanation}</p>
          {q.reference && (
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table>
                <thead><tr>{q.reference.columns.map(c => <th key={c} className="label-mono">{c}</th>)}</tr></thead>
                <tbody>{q.reference.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={next}>
              {idx < questions.length - 1 ? 'Next Question' : 'Finish'} <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
