import { getCurrentLearningState } from '../../services/dashboardService';
import { getOverallCompletion } from '../../services/progressService';
import { usePlayer } from '../../store/PlayerContext';

export function ContextCard() {
  const { stats } = usePlayer();
  const cont = getCurrentLearningState(stats);
  const overall = getOverallCompletion(stats);
  return (
    <div className="ui-pod" style={{ minWidth: 260 }}>
      <div className="ui-pod-top"><span className="ui-index">Current position</span><span className="ui-mono">Lv {stats.level}</span></div>
      {cont ? (
        <>
          <div className="ui-pod-title">{cont.lessonTitle}</div>
          <div className="ui-mono ui-muted">W{cont.worldNumber} · Level {cont.levelNumber} · Lesson {cont.lessonIndex}/{cont.lessonCount}</div>
        </>
      ) : (
        <div className="ui-pod-title">No lesson in progress</div>
      )}
      <div className="hero-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Curriculum completion">
        <div style={{ width: `${overall}%` }} />
      </div>
      <div className="ui-mono ui-muted">{overall}% curriculum · {stats.xp.toLocaleString()} XP</div>
    </div>
  );
}
