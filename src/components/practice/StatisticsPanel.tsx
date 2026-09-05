import { usePlayer } from '../../store/PlayerContext';
import { getCodingStats } from '../../services/statsService';
import { lastNDays } from '../../services/xpService';
import { ActivityHeatmap, Chip } from '../common/ui';

export function StatisticsPanel() {
  const { stats } = usePlayer();
  const s = getCodingStats(stats);
  const recent = lastNDays(stats.activity, 7).filter(d => d.minutes > 0 || d.submissions > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-4">
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>PROBLEMS SOLVED</div><div className="t-hmd">{s.solved}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>E {s.easy} · M {s.medium} · H {s.hard}</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>ACCEPTANCE</div><div className="t-hmd">{s.acceptance}%</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{s.submissions} submissions</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>CODING XP</div><div className="t-hmd">{s.codingXp}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>from solved problems</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>CODING RATING</div><div className="t-hmd">{s.rating}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>derived from real solves</p></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><div className="label-mono">ACTIVITY HEATMAP // LAST 16 WEEKS</div><Chip>{stats.streak} DAY STREAK</Chip></div>
        <div style={{ overflowX: 'auto' }}><ActivityHeatmap activity={stats.activity} /></div>
        <p className="t-caption" style={{ marginTop: 12, color: 'var(--fg-muted)' }}>Intensity = XP earned + minutes practiced on that day. Empty until real activity exists.</p>
      </div>
      <div className="card">
        <div className="label-mono" style={{ marginBottom: 12 }}>RECENT ACTIVITY</div>
        {recent.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>No recorded activity yet. Solve a problem or complete a lesson to start the log.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(d => (
              <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between' }} className="t-body-sm">
                <span className="mono" style={{ color: 'var(--fg-muted)' }}>{d.key}</span>
                <span>{d.minutes} min · {d.submissions} submissions · {d.problemsSolved} solved · <span style={{ color: '#a5a1ff' }}>{d.xpEarned} XP</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
