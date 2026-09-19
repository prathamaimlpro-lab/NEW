import { Link } from 'react-router-dom';
import { usePlayer } from '../store/PlayerContext';

export default function Profile() {
  const { stats, resetProgress } = usePlayer();
  return (
    <>
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>Profile</div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>Your Profile</h1>
        <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
          Your learning summary. Progress is stored on this device and syncs across devices when a Supabase account is connected.
        </p>
      </header>

      <section className="p-strip" style={{ border: '1px solid var(--border-subtle, #232732)', borderRadius: 6 }}>
        <div><span className="d-big">{stats.completedLessons.length}</span><span className="lbl">lessons completed</span></div>
        <div><span className="d-big">{stats.completedQuestions.length}</span><span className="lbl">questions correct</span></div>
        <div><span className="d-big">{stats.unlockedAchievements.length}</span><span className="lbl">milestones</span></div>
        <div><span className="d-big">{stats.bestStreak}d</span><span className="lbl">best streak</span></div>
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Account</span></div>
        <div className="lrow">
          <span className="rail"><span className="dot" style={{ background: 'var(--signal-strong, #38BDFB)' }} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>Level {stats.level} · {stats.xp.toLocaleString()} XP</span>
            <span className="d-micro">Current streak {stats.streak} days</span>
          </span>
        </div>
        <div className="lrow">
          <span className="rail"><span className="dot" style={{ background: 'var(--text-subtle, #475569)' }} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>Learning since {stats.firstActiveDate ?? '—'}</span>
            <span className="d-micro">Activity history powers the heatmap and timeline</span>
          </span>
        </div>
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Data</span></div>
        <p className="d-body" style={{ marginBottom: 12 }}>
          Resetting clears lessons, practice, projects and activity on this device only. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to="/progress">View Progress</Link>
          <button type="button" className="btn btn-destructive" onClick={() => { if (window.confirm('Reset all local progress? This cannot be undone.')) resetProgress(); }}>
            Reset Local Progress
          </button>
        </div>
      </section>
    </>
  );
}
