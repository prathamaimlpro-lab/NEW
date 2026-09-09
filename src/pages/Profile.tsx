import { Link } from 'react-router-dom';
import { AuthPanel } from '../components/account/AuthPanel';
import { Emblem } from '../components/common/Emblem';
import { Chip } from '../components/common/ui';
import { getTierName } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';

export default function Profile() {
  const { stats, resetProgress } = usePlayer();
  return (
    <>
      <section className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <Emblem size={64} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 className="t-hmd">Cadet Engineer</h1>
          <p className="t-body-sm" style={{ color: 'var(--fg-2)' }}>Enrolled {stats.firstActiveDate ?? 'today'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Chip tone="info">LEVEL {stats.level} {getTierName(stats.level).toUpperCase()}</Chip>
          <Chip tone="success">{stats.streak} DAY STREAK</Chip>
          <Chip>{stats.xp.toLocaleString()} XP</Chip>
        </div>
      </section>

      <AuthPanel />

      <section className="grid-4">
        <div className="card"><div className="t-hmd">{stats.completedLessons.length}</div><p className="t-body-sm" style={{ marginTop: 4 }}>Lessons verified</p></div>
        <div className="card"><div className="t-hmd">{stats.completedQuestions.length}</div><p className="t-body-sm" style={{ marginTop: 4 }}>Questions solved</p></div>
        <div className="card"><div className="t-hmd">{stats.unlockedAchievements.length}</div><p className="t-body-sm" style={{ marginTop: 4 }}>Milestones</p></div>
        <div className="card"><div className="t-hmd">{stats.bestStreak}</div><p className="t-body-sm" style={{ marginTop: 4 }}>Best streak</p></div>
      </section>

      <section className="card">
        <div className="label-mono" style={{ marginBottom: 12 }}>DATA & PRIVACY</div>
        <p className="t-body" style={{ maxWidth: 640 }}>Without a Supabase backend, your progress lives only on this device (local cache). With Supabase configured, the server copy in your account is authoritative and syncs across devices.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Link className="btn btn-secondary" to="/progress">View telemetry</Link>
          <button className="btn btn-ghost" style={{ color: 'var(--error)' }} onClick={() => { if (window.confirm('Reset all local progress? This cannot be undone.')) resetProgress(); }}>
            Reset local progress
          </button>
        </div>
      </section>
    </>
  );
}
