import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentLearningState, getRankedAction } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: '24px', fontWeight: 600,
  color: 'var(--text-primary, #F8FAFC)', marginBottom: 8,
};

export function NextBestAction() {
  const { stats } = usePlayer();
  const cont = useMemo(() => getCurrentLearningState(stats), [stats]);
  const action = useMemo(() => getRankedAction(stats, cont?.lessonId ?? null), [stats, cont]);
  const begun = cont?.begun ?? false;

  return (
    <section className="p-rec" style={{ ['--rec-accent' as string]: action?.accent === 'weak' ? 'var(--signal-weak, #F59E0B)' : 'var(--signal-strong, #38BDFB)' }}>
      <div className="d-eyebrow" style={{ marginBottom: 10 }}>Next Best Action</div>
      {action ? (
        <>
          <p style={HEADLINE_STYLE}>{action.headline}</p>
          <p className="d-body" style={{ marginBottom: 16 }}>{action.why}</p>
          <Link className="cta-outline" to={action.to}>{action.headline}</Link>
        </>
      ) : begun ? (
        <>
          <p style={HEADLINE_STYLE}>You're on track</p>
          <p className="d-body" style={{ marginBottom: 16 }}>
            No second action is needed right now — your current lesson is the best use of this session.
          </p>
          <Link className="cta-outline" to="/progress">View Progress</Link>
        </>
      ) : (
        <>
          <p style={HEADLINE_STYLE}>Start your first lesson</p>
          <p className="d-body" style={{ marginBottom: 16 }}>
            Pixel begins tracking activity, mastery and practice patterns after your first lesson.
          </p>
          <Link className="cta-outline" to="/learn">Open Curriculum</Link>
        </>
      )}
    </section>
  );
}
