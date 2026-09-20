import { Link } from 'react-router-dom';
import { getRankedAction } from '../../services/dashboardService';
import { useDashboardData } from '../../dashboard/useDashboard';
import { usePlayer } from '../../store/PlayerContext';

export function LearningWorkspace() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  const cont = d.continueLearning.data;
  /* Exclude the continue-lesson target so NBA is genuinely different. */
  const nba = getRankedAction(stats, cont?.lessonId ?? null);

  return (
    <section className="d3-workspace" aria-label="Primary learning workspace">
      <div className="d3-ws-main">
        <div className="d3-eyebrow">Continue Learning</div>
        {cont ? (
          <>
            <div className="d3-ws-context">World {cont.worldNumber} · Level {cont.levelNumber} · Lesson {cont.lessonIndex}/{cont.lessonCount}</div>
            <h2 className="d3-ws-title">{cont.lessonTitle}</h2>
            <div className="d3-ws-meta">{cont.minutesRemaining} min remaining · +{cont.xp} XP · {cont.lessonProgress}% complete</div>
            <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={cont.lessonProgress} aria-label="Lesson progress">
              <div style={{ width: `${cont.lessonProgress}%` }} />
            </div>
            <Link className="cta-solid" to={`/learn/lesson/${cont.lessonId}`}>
              {cont.mode === 'resume' ? 'Continue Lesson' : cont.mode === 'start' ? 'Start Lesson' : 'Start First Lesson'}
            </Link>
          </>
        ) : (
          <div className="dempty">All published lessons are complete. New content is being authored.</div>
        )}
      </div>

      <aside className="d3-ws-side" aria-label="Next best action">
        <div className="d3-eyebrow">Next Best Action</div>
        {nba ? (
          <>
            <p className="d3-nba-head">{nba.headline}</p>
            <p className="d3-nba-why">{nba.why}</p>
            <Link className="cta-outline" to={nba.to}>{nba.headline}</Link>
          </>
        ) : (
          <p className="d3-nba-why">You're on track — your current lesson is the best next step.</p>
        )}
      </aside>
    </section>
  );
}
