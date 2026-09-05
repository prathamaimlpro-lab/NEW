import { Link } from 'react-router-dom';
import { ActivityHeatmap, CadenceChart, Chip, Progress } from '../components/common/ui';
import { worlds } from '../data/curriculum';
import { getWorldProgress } from '../services/progressService';
import { getCodingStats } from '../services/statsService';
import { getTierName, getXpProgress } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';

export default function ProgressPage() {
  const { stats } = usePlayer();
  const s = getCodingStats(stats);

  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>TELEMETRY</div>
        <h1 className="t-hlg">Progress Report</h1>
      </section>
      <section className="grid-4">
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>TOTAL XP</div><div className="t-hmd">{stats.xp.toLocaleString()}</div><div style={{ marginTop: 8 }}><Chip tone="primary">LEVEL {stats.level} {getTierName(stats.level).toUpperCase()}</Chip></div><div style={{ marginTop: 12 }}><Progress value={getXpProgress(stats.xp)} /></div></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>STREAK</div><div className="t-hmd">{stats.streak} days</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>Best: {stats.bestStreak} days</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>LESSONS</div><div className="t-hmd">{stats.completedLessons.length}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>verified completions</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>PROBLEMS</div><div className="t-hmd">{s.solved}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{s.acceptance}% acceptance</p></div>
      </section>
      <section className="card">
        <div className="label-mono" style={{ marginBottom: 16 }}>WORLD PROGRESS // 13 WORLDS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {worlds.map(w => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) 48px', gap: 12, alignItems: 'center' }}>
              <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>W{String(w.number).padStart(2, '0')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}><Progress value={getWorldProgress(stats, w)} /></div>
                <span className="t-caption" style={{ color: 'var(--fg-secondary)' }}>{w.title}</span>
              </div>
              <span className="mono t-caption" style={{ textAlign: 'right', color: 'var(--fg-muted)' }}>{getWorldProgress(stats, w)}%</span>
            </div>
          ))}
        </div>
      </section>
      <section className="grid-2">
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>ACTIVITY HEATMAP // 16 WEEKS</div>
          <div style={{ overflowX: 'auto' }}><ActivityHeatmap activity={stats.activity} /></div>
          <div style={{ marginTop: 16 }}><CadenceChart activity={stats.activity} /></div>
        </div>
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>CODING STATISTICS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><div className="t-hmd">{s.solved}</div><p className="t-caption" style={{ color: 'var(--fg-muted)' }}>Solved (E{s.easy}/M{s.medium}/H{s.hard})</p></div>
            <div><div className="t-hmd">{s.acceptance}%</div><p className="t-caption" style={{ color: 'var(--fg-muted)' }}>Acceptance</p></div>
            <div><div className="t-hmd">{s.codingXp}</div><p className="t-caption" style={{ color: 'var(--fg-muted)' }}>Coding XP</p></div>
            <div><div className="t-hmd">{s.rating}</div><p className="t-caption" style={{ color: 'var(--fg-muted)' }}>Rating</p></div>
          </div>
          <Link to="/practice" className="btn btn-secondary btn-sm" style={{ marginTop: 20 }}>Open Problem Tracker</Link>
        </div>
      </section>
    </>
  );
}
