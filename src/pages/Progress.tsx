import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeatmapSection } from '../components/dashboard/analytics';
import { levels, worlds } from '../data/curriculum';
import { getCompletedLevelCount, getOverallProgress, getWorldProgress, isLevelCompleted } from '../services/progressService';
import { getCodingStats } from '../services/statsService';
import { usePlayer } from '../store/PlayerContext';

export default function ProgressPage() {
  const { stats } = usePlayer();
  const coding = useMemo(() => getCodingStats(stats), [stats]);

  return (
    <>
      <section className="p-strip" style={{ border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
        <div><span className="d-big">{stats.xp.toLocaleString()}</span><span className="lbl">XP</span></div>
        <div><span className="d-big">{stats.streak}d</span><span className="lbl">streak</span></div>
        <div><span className="d-big">{getCompletedLevelCount(stats)}</span><span className="lbl">levels</span></div>
        <div><span className="d-big">{getOverallProgress(stats)}%</span><span className="lbl">overall</span></div>
      </section>

      <section className="p-chart">
        <div className="p-head"><span className="d-eyebrow">World progress</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {worlds.map(w => {
            const wl = levels.filter(l => l.worldId === w.id);
            const done = wl.filter(l => isLevelCompleted(stats, l)).length;
            return (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 110px', gap: 12, alignItems: 'center' }}>
                <span className="d-body" style={{ color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>W{w.number} · {w.title}</span>
                <div className="hero-bar"><div style={{ width: `${getWorldProgress(stats, w.id)}%`, background: 'var(--signal-mastered, #10B981)' }} /></div>
                <span className="d-micro" style={{ textAlign: 'right' }}>{done}/{wl.length} · {getWorldProgress(stats, w.id)}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <HeatmapSection />

      <section className="p-chart">
        <div className="p-head">
          <span className="d-eyebrow">Practice</span>
          <Link className="d-micro" style={{ color: 'var(--signal-strong, #38BDFB)' }} to="/practice">Tracker →</Link>
        </div>
        <div className="p-strip" style={{ border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
          <div><span className="d-big">{coding.solved}</span><span className="lbl">solved</span></div>
          <div><span className="d-big">{coding.submissions}</span><span className="lbl">submissions</span></div>
          <div><span className="d-big">{coding.submissions ? `${coding.acceptance}%` : '—'}</span><span className="lbl">success</span></div>
          <div><span className="d-big">{coding.rating}</span><span className="lbl">rating</span></div>
        </div>
      </section>
    </>
  );
}
