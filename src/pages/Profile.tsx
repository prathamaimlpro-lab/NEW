import { Link } from 'react-router-dom';
import { AuthPanel } from '../components/account/AuthPanel';
import { Icon } from '../components/common/Icon';
import { achievementsData } from '../data/achievements';
import { usePlayer } from '../store/PlayerContext';

function exportProgress(stats: unknown, since: string | null) {
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pixel-progress-${since ?? 'export'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Profile() {
  const { stats, resetProgress } = usePlayer();
  const recentMilestones = [...stats.unlockedAchievements].reverse().slice(0, 3)
    .map(id => achievementsData.find(a => a.id === id))
    .filter((a): a is (typeof achievementsData)[number] => !!a);

  return (
    <>
      <header style={{ padding: '24px 2px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
        <span className="avatar" aria-hidden="true" style={{ width: 56, height: 56, flex: 'none' }}>
          <Icon name="profile" size={28} />
        </span>
        <div>
          <div className="d-eyebrow" style={{ marginBottom: 8 }}>Profile</div>
          <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>Your Profile</h1>
          <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
            Your learning summary. Progress is stored on this device and syncs across devices when a Supabase account is connected.
          </p>
        </div>
      </header>

      <section className="p-strip" style={{ border: '1px solid var(--border-subtle, #232732)', borderRadius: 6 }}>
        <div><span className="d-big">{stats.completedLessons.length}</span><span className="lbl">lessons completed</span></div>
        <div><span className="d-big">{stats.completedQuestions.length}</span><span className="lbl">questions correct</span></div>
        <Link to="/achievements" aria-label={`${stats.unlockedAchievements.length} milestones — view all`}>
          <span className="d-big">{stats.unlockedAchievements.length}</span><span className="lbl">milestones</span>
        </Link>
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
        {/* Real sign-in / sync status and controls. Renders nothing when this
            deployment has no Supabase project configured, so it never shows
            a dead-end auth form. */}
        <div style={{ marginTop: 12 }}><AuthPanel /></div>
      </section>

      <section className="p-list">
        <div className="p-head">
          <span className="d-eyebrow">Milestones</span>
          <Link className="btn btn-ghost btn-sm" to="/achievements">View all →</Link>
        </div>
        {recentMilestones.length === 0 ? (
          <p className="d-body" style={{ color: 'var(--text-muted, #5F6B76)' }}>
            No milestones yet. They're earned exclusively through verified activity — complete a lesson or solve a practice question to unlock your first one.
          </p>
        ) : (
          recentMilestones.map(a => (
            <div className="lrow" key={a.id}>
              <span className="rail"><Icon name={a.icon} size={16} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>{a.title}</span>
                <span className="d-micro">{a.description}</span>
              </span>
              {a.xp > 0 && <span className="chip chip-success">+{a.xp} XP</span>}
            </div>
          ))
        )}
      </section>

      <section className="p-list">
        <div className="p-head"><span className="d-eyebrow">Data</span></div>
        <p className="d-body" style={{ marginBottom: 12 }}>
          Export downloads everything below as a single JSON file. Resetting clears lessons, practice, projects and activity on this device only — neither action affects a connected Supabase account. Reset cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to="/progress">View Progress</Link>
          <button type="button" className="btn btn-secondary" onClick={() => exportProgress(stats, stats.firstActiveDate)}>
            Export My Data
          </button>
          <button type="button" className="btn btn-destructive" onClick={() => { if (window.confirm('Reset all local progress? This cannot be undone.')) resetProgress(); }}>
            Reset Local Progress
          </button>
        </div>
      </section>
    </>
  );
}
