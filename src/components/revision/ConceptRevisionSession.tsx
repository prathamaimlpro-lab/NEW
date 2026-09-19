import { useEffect, useMemo, useState } from 'react';
import { PracticeEngine } from '../practice/PracticeEngine';
import { getRevisionPlan } from '../../services/conceptMastery';
import { hydrateRemote } from '../../services/contentRepo';
import { getPracticeBank } from '../../services/practiceService';
import { usePlayer } from '../../store/PlayerContext';

export function ConceptRevisionSession() {
  const { stats } = usePlayer();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openConcept, setOpenConcept] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    hydrateRemote()
      .then(() => { if (on) setReady(true); })
      .catch(() => { if (on) { setError('Could not load the revision plan.'); setReady(true); } });
    return () => { on = false; };
  }, []);

  const plan = useMemo(() => (ready ? getRevisionPlan(stats) : null), [ready, stats]);

  if (!ready) return <div className="skel" style={{ height: 100 }} aria-busy="true" />;
  if (error) return <div className="state-error" role="alert"><span>{error}</span></div>;
  if (!plan || plan.length === 0) {
    return (
      <div className="dempty">
        No revision needed right now. Items appear here when accuracy, confidence, mistakes or spaced-revision timing indicate risk.
      </div>
    );
  }

  return (
    <div className="block-stack">
      <div className="d-eyebrow">Concept revision · reuses published practice</div>
      {plan.map(item => {
        const qs = getPracticeBank().filter(q => item.questionIds.includes(q.id));
        const open = openConcept === item.concept.id;
        return (
          <div key={item.concept.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="d-title">{item.concept.title}</span>
              <button type="button" className="btn btn-secondary btn-sm" aria-expanded={open}
                onClick={() => setOpenConcept(open ? null : item.concept.id)}>
                {open ? 'Close' : 'Revise now'}
              </button>
            </div>
            <p className="d-micro" style={{ color: 'var(--text-muted)' }}>Why: {item.reason}</p>
            {open && qs.length > 0 && <PracticeEngine questions={qs as any} title={`Revision · ${item.concept.title}`} />}
          </div>
        );
      })}
    </div>
  );
}
