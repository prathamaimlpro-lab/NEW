import { Link } from 'react-router-dom';
import { CadenceChart, Chip, Progress } from '../components/common/ui';
import { levels } from '../data/curriculum';
import { getLevelProgress } from '../services/progressService';
import { getTierName, getXpProgress } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';
import { Difficulty } from '../types';

export default function ProgressPage() {
  const { stats } = usePlayer();
  const recs = Object.values(stats.practice);
  const accuracy = recs.length === 0 ? 0 : Math.round((recs.filter(r => r.correct).length / recs.length) * 100);
  const byDiff = (['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => {
    const rs = recs.filter(r => r.difficulty === d);
    return { d, total: rs.length, correct: rs.filter(r => r.correct).length };
  });

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
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>ACCURACY</div><div className="t-hmd">{accuracy}%</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{recs.length} attempts</p></div>
      </section>
      <section className="grid-2">
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>SESSION LOG // WEEKLY CADENCE</div>
          <CadenceChart activity={stats.activity} />
        </div>
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>DIFFICULTY PERFORMANCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {byDiff.map(row => (
              <div key={row.d}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }} className="t-body-sm">
                  <Chip tone={row.d === 'EASY' ? 'success' : row.d === 'MEDIUM' ? 'warning' : 'error'}>{row.d}</Chip>
                  <span className="mono" style={{ color: 'var(--fg-muted)' }}>{row.correct}/{row.total} correct</span>
                </div>
                <Progress value={row.total === 0 ? 0 : (row.correct / row.total) * 100} tone="info" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="card">
        <div className="label-mono" style={{ marginBottom: 16 }}>CURRICULUM COMPLETION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {levels.map(l => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) 48px', gap: 12, alignItems: 'center' }}>
              <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>L{String(l.id).padStart(2, '0')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}><Progress value={getLevelProgress(stats, l)} /></div>
                <span className="t-caption clamp-2" style={{ color: 'var(--fg-secondary)', minWidth: 0 }}>{l.title}</span>
              </div>
              <span className="mono t-caption" style={{ textAlign: 'right', color: 'var(--fg-muted)' }}>{getLevelProgress(stats, l)}%</span>
            </div>
          ))}
        </div>
        <Link to="/achievements" className="btn btn-secondary btn-sm" style={{ marginTop: 20 }}>View milestones</Link>
      </section>
    </>
  );
}
