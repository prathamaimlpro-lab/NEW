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
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>Progress</div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>Your learning analytics</h1>
        <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
          Completion, mastery and practice performance across the whole curriculum, in one place.
        </p>
      </header>

      <section className="p-strip" style={{ border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
        <div><span className="d-big">{stats.xp.toLocaleString()}</span><span className="lbl">XP</span></div>
        <div><span className="d-big">{stats.streak}d</span><span className="lbl">streak</span></div>
        <div><span className="d-big">{getCompletedLevelCount(stats)}</span><span className="lbl">levels</span></div>
        <div><span className="d-big">{getOverallProgress(stats)}%</span><span className="lbl">overall</span></div>
      </section>

      <section className="p-chart">
        <div className="p-head"><h2 className="d-eyebrow" style={{ margin: 0 }}>World progress</h2></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {worlds.map(w => {
            const wl = levels.filter(l => l.worldId === w.id);
            const done = wl.filter(l => isLevelCompleted(stats, l)).length;
            const pct = getWorldProgress(stats, w.id);
            return (
              <div key={w.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 220px) minmax(0,1fr) 96px', gap: 12, alignItems: 'center' }}>
                <span className="d-body" style={{ color: 'var(--text-primary)', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', textWrap: 'balance' }}>
                  W{w.number} · {w.title}
                </span>
                <div
                  className="hero-bar"
                  style={{ height: 6 }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`${w.title} progress`}
                >
                  <div style={{ width: `${pct}%` }} />
                </div>
                <span className="d-micro" style={{ textAlign: 'right' }}>{done}/{wl.length} · {pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <HeatmapSection />

      <section className="p-chart">
        <div className="p-head">
          <h2 className="d-eyebrow" style={{ margin: 0 }}>Practice</h2>
          <Link className="d-micro" style={{ color: 'var(--action-text)' }} to="/practice">Open tracker →</Link>
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
