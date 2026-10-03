import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../../store/PlayerContext';
import type { Question } from '../../types';
import '../../styles/practice5.css';

const LETTERS = 'ABCDEFGH';
const answerIndexOf = (q: any): number => q.answerIndex ?? q.correct ?? q.correctIndex ?? 0;

export function PracticeEngine({ questions, title }: { questions: Question[]; title: string }) {
  const { stats, answerQuestion } = usePlayer();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  if (!questions || questions.length === 0) {
    return <div className="dempty">No questions available yet.</div>;
  }

  const reset = () => { setIndex(0); setSelected(null); setChecked(null); setDone(false); setSessionXp(0); setSessionCorrect(0); };

  if (done) {
    const pct = Math.round((sessionCorrect / questions.length) * 100);
    return (
      <section className="pe-card" aria-label={`${title} results`}>
        <h2 className="ui-h2">Session complete</h2>
        <div className="pe-score">{pct}%</div>
        <p className="ui-desc">{sessionCorrect} of {questions.length} correct · +{sessionXp} XP earned</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to="/">Back to Home</Link>
          <button type="button" className="btn btn-primary" onClick={reset}>Practice again</button>
        </div>
      </section>
    );
  }

  const q: any = questions[index];
  const answer = answerIndexOf(q);

  const check = () => {
    if (selected === null) return;
    const correct = selected === answer;
    const wasCorrect = !!(stats.practice as any)[q.id]?.correct;
    setChecked(correct);
    answerQuestion(q, correct);
    if (correct) {
      setSessionCorrect(c => c + 1);
      if (!wasCorrect) setSessionXp(x => x + (q.xp ?? 10));
    }
  };

  const next = () => {
    if (index + 1 < questions.length) { setIndex(i => i + 1); setSelected(null); setChecked(null); }
    else setDone(true);
  };

  return (
    <section className="pe-card" aria-label={title}>
      <div className="pe-top">
        <span className="ui-index">Question {index + 1} of {questions.length}</span>
        <span className="pe-badges">
          <span className="chip">{q.difficulty}</span>
          <span className="chip chip-success">+{q.xp ?? 10} XP</span>
        </span>
      </div>
      <div className="hero-bar pe-bar" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1} aria-label={`Question ${index + 1} of ${questions.length}`}>
        <div style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <h2 className="pe-question">{q.question ?? q.prompt}</h2>

      <div className="pe-options" role="group" aria-label="Answer options">
        {(q.options ?? []).map((opt: string, oi: number) => {
          const state = checked === null
            ? (selected === oi ? 'selected' : '')
            : (oi === answer ? 'correct' : selected === oi ? 'wrong' : '');
          return (
            <button key={oi} type="button" className={`q-option ${state}`} disabled={checked !== null}
              aria-pressed={selected === oi}
              onClick={() => { if (checked === null) setSelected(oi); }}>
              <span className="letter" aria-hidden="true">{LETTERS[oi]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {checked !== null && (
        <div className={`pe-explain ${checked ? 'ok' : 'bad'}`} role="status">
          {checked ? 'Correct. ' : 'Not quite. '}{q.explanation ?? ''}
        </div>
      )}

      <div className="pe-cta-bar">
        {checked === null
          ? <button type="button" className="btn btn-primary pe-cta" disabled={selected === null} onClick={check}>Check answer</button>
          : <button type="button" className="btn btn-primary pe-cta" onClick={next}>{index + 1 < questions.length ? 'Next question' : 'See results'}</button>}
      </div>
    </section>
  );
}
