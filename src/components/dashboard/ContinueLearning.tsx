import { Link } from 'react-router-dom';
import type { CurrentLearningState } from '../../services/dashboardService';
import { relTime } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

export function ContinueLearning({ state }: { state: CurrentLearningState | null }) {
  const { syncState } = usePlayer();

  if (syncState === 'loading') {
    return (
      <section className="p-hero" aria-busy="true">
        <div className="hero-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="skel" style={{ height: 12, width: 180 }} />
            <div className="skel" style={{ height: 28, width: '60%' }} />
            <div className="skel" style={{ height: 12, width: 240 }} />
            <div className="skel" style={{ height: 4, width: '100%' }} />
          </div>
          <div className="skel" style={{ height: 44, width: '100%' }} />
        </div>
      </section>
    );
  }

  if (!state) {
    return (
      <section className="p-hero">
        <div className="hero-grid">
          <div>
            <div className="d-eyebrow" style={{ marginBottom: 10 }}>Continue Learning</div>
            <h2 className="d-cardtitle">All published lessons complete</h2>
            <p className="d-body" style={{ marginTop: 8 }}>New content is being authored. Revisit mastery or practice in the meantime.</p>
          </div>
          <div><Link className="cta-outline" to="/practice">Open practice</Link></div>
        </div>
      </section>
    );
  }

  const notBegun = !state.begun;

  return (
    <section className="p-hero">
      <div className="hero-grid">
        <div>
          <div className="d-eyebrow" style={{ marginBottom: 10 }}>Continue Learning</div>
          <div className="d-micro" style={{ color: 'var(--signal-strong)', marginBottom: 6 }}>
            WORLD {state.worldNumber} · LEVEL {state.levelNumber}
          </div>
          <h2 className="d-cardtitle" style={{ fontSize: 28, lineHeight: '36px', marginBottom: 8 }}>
            {notBegun ? 'Start your first lesson' : state.lessonTitle}
          </h2>
          {!notBegun && (
            <>
              <div className="d-micro" style={{ marginBottom: 12 }}>
                Lesson {state.lessonIndex} of {state.lessonCount} · {state.minutesRemaining}m · +{state.xp} XP
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="d-micro">
                <span>{state.lessonProgress}%</span>
              </div>
              <div className="hero-bar" style={{ marginTop: 4 }} role="progressbar" aria-valuenow={state.lessonProgress} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${state.lessonProgress}%` }} />
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
          <Link className="cta-solid" to={`/learn/lesson/${state.lessonId}`}>
            {notBegun ? 'Begin' : state.lessonProgress > 0 ? 'Continue Learning' : 'Start Learning'}
          </Link>
          <span className="d-micro" style={{ color: 'var(--text-muted)' }}>
            {relTime(state.lastActivityIso) ? `Last opened ${relTime(state.lastActivityIso)}` : 'Not opened yet'}
          </span>
        </div>
      </div>
    </section>
  );
}
