import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  assessmentQuestions, getAssessmentsForLesson, getAssessmentsForLevel, getAssessmentsForWorld,
  getRecord, recordAttempt, scoreAnswers, type AssessmentExt, type ScoreResult,
} from '../../services/assessmentService';
import { usePlayer } from '../../store/PlayerContext';

type Phase = 'ready' | 'in-progress' | 'submitted';

export function AssessmentRunner({ assessment }: { assessment: AssessmentExt }) {
  const { answerQuestion } = usePlayer();
  const questions = useMemo(() => assessmentQuestions(assessment), [assessment]);
  const [phase, setPhase] = useState<Phase>('ready');
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const record = getRecord(assessment.id);

  if (questions.length === 0) {
    return <div className="dempty">No published questions are configured for this assessment yet.</div>;
  }

  const start = () => { setSelections({}); setResult(null); setPhase('in-progress'); };
  const submit = () => {
    const res = scoreAnswers(assessment, questions, selections);
    for (const q of questions) answerQuestion(q as any, selections[q.id] === q.answerIndex);
    recordAttempt(assessment, res);
    setResult(res);
    setPhase('submitted');
  };

  if (phase === 'ready') {
    return (
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="d-title">{assessment.title ?? `Assessment ${assessment.id}`}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="chip">scope: {assessment.scope ?? 'lesson'}</span>
          <span className="chip">{questions.length} questions</span>
          <span className="chip">pass ≥{assessment.passThreshold ?? 70}%</span>
          {assessment.version && <span className="chip">v{assessment.version}</span>}
        </div>
        {assessment.blueprint && <p className="t-body-sm">{assessment.blueprint}</p>}
        {assessment.difficultyDistribution && (
          <p className="t-body-sm">
            Distribution: {Object.entries(assessment.difficultyDistribution).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(', ')}
          </p>
        )}
        {assessment.prerequisiteCoverage && assessment.prerequisiteCoverage.length > 0 && (
          <p className="t-body-sm">Covers: {assessment.prerequisiteCoverage.join(', ')}</p>
        )}
        {assessment.scoring && <p className="t-body-sm">Scoring: {assessment.scoring}</p>}
        {record && (
          <p className="d-micro" style={{ color: 'var(--text-muted)' }}>
            Attempts: {record.attempts} · last score {record.lastScore}% · {record.passed ? 'passed' : 'needs review'}
          </p>
        )}
        <div><button type="button" className="btn btn-primary" onClick={start}>Start assessment</button></div>
      </section>
    );
  }

  if (phase === 'in-progress') {
    const answered = Object.keys(selections).length;
    return (
      <section className="card" aria-label="Assessment in progress">
        {questions.map((q, i) => (
          <fieldset key={q.id} style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
            <legend className="t-body" style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q.question}</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, oi) => (
                <label key={oi} className="q-option" style={{ cursor: 'pointer' }}>
                  <input
                    type="radio" name={q.id} checked={selections[q.id] === oi}
                    onChange={() => setSelections(s => ({ ...s, [q.id]: oi }))}
                    style={{ accentColor: 'var(--action)' }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button type="button" className="btn btn-primary" onClick={submit} disabled={answered < questions.length}>
          Submit assessment ({answered}/{questions.length})
        </button>
      </section>
    );
  }

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Assessment result">
      <div className="d-title">{assessment.title ?? `Assessment ${assessment.id}`}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="chip">Score {result!.pct}%</span>
        <span className={`chip ${result!.passed ? 'chip-success' : 'chip-warning'}`}>{result!.passed ? 'Passed' : 'Needs Review'}</span>
        <span className="chip">{result!.correct}/{result!.total}</span>
      </div>
      {result!.incorrectConcepts.length > 0 && (
        <p className="t-body-sm">
          Focus next: {result!.incorrectConcepts.join(', ')}.{' '}
          <Link style={{ color: 'var(--action-text)' }} to="/practice">Open revision →</Link>
        </p>
      )}
      {assessment.remediation && <p className="t-body-sm">{assessment.remediation}</p>}
      <p className="d-micro" style={{ color: 'var(--text-muted)' }}>
        Passing confirms evidence for these concepts; mastery still builds from repeated practice, revision and confidence — not from this result alone.
      </p>
      <div><button type="button" className="btn btn-secondary" onClick={start}>Retry</button></div>
    </section>
  );
}

export function AssessmentsForScope(props: { scope: 'lesson' | 'level' | 'world'; lessonId?: string; levelId?: string; worldId?: string }) {
  const list = props.scope === 'lesson'
    ? getAssessmentsForLesson(props.lessonId!)
    : props.scope === 'level'
      ? getAssessmentsForLevel(props.levelId!)
      : getAssessmentsForWorld(props.worldId!);
  if (!list.length) return null;
  return <div className="block-stack">{list.map(a => <AssessmentRunner key={a.id} assessment={a as AssessmentExt} />)}</div>;
}
