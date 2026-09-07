import { Link } from 'react-router-dom';
import { ActivityHeatmap, CadenceChart, Chip, Progress } from '../components/common/ui';
import { worlds } from '../data/curriculum';
import { getRevisionDue, getWorldProgress } from '../services/progressService';
import { getCodingStats, getOverallMastery, getTopicMastery } from '../services/statsService';
import { getTierName, getXpProgress } from '../services/xpService';
import { usePlayer } from '../store/PlayerContext';

export default function ProgressPage() {
  const { stats } = usePlayer();
  const s = getCodingStats(stats);
  const mastery = getTopicMastery(stats).filter(t => t.activity > 0);
  const strong = mastery.filter(t => t.pct >= 70).slice(0, 4);
  const weak = [...mastery].sort((a, b) => a.pct - b.pct).filter(t => t.pct < 70).slice(0, 4);
  const revision = getRevisionDue(stats);
  const weekCount = Object.values(stats.activity).slice(-7).reduce((a, b) => a + b.count, 0);

  return (
    <>
      <section>
        <div className="label-mono" style={{ marginBottom: 8 }}>LEARNING TRACKER</div>
        <h1 className="t-hlg">Knowledge & Mastery</h1>
      </section>

      <section className="grid-4">
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>OVERALL MASTERY</div><div className="t-hmd">{getOverallMastery(stats)}%</div><div style={{ marginTop: 12 }}><Progress value={getOverallMastery(stats)} /></div></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>TOTAL XP</div><div className="t-hmd">{stats.xp.toLocaleString()}</div><div style={{ marginTop: 8 }}><Chip tone="primary">LEVEL {stats.level} {getTierName(stats.level).toUpperCase()}</Chip></div><div style={{ marginTop: 12 }}><Progress value={getXpProgress(stats.xp)} /></div></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>COMPLETIONS</div><div className="t-hmd">{stats.completedLessons.length}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>lessons · {stats.completedVisualizations.length} visualizations · {s.solved} problems</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>THIS WEEK</div><div className="t-hmd">{weekCount}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>learning activities · streak {stats.streak}d</p></div>
      </section>

      <section className="card">
        <div className="label-mono" style={{ marginBottom: 16 }}>LEARNING HEATMAP // 16 WEEKS</div>
        <div style={{ overflowX: 'auto' }}><ActivityHeatmap activity={stats.activity} /></div>
        <p className="t-caption" style={{ marginTop: 12, color: 'var(--fg-muted)' }}>Each cell counts real activities: lessons, solved problems, correct checks, visualizations.</p>
        <div style={{ marginTop: 16 }}><CadenceChart activity={stats.activity} /></div>
      </section>

      <section className="card">
        <div className="label-mono" style={{ marginBottom: 16 }}>DOMAIN PROGRESS // 100 LEVELS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {worlds.map(w => (
            <div key={w.id} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) 48px', gap: 12, alignItems: 'center' }}>
              <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>D{String(w.number).padStart(2, '0')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}><Progress value={getWorldProgress(stats, w.id)} /></div>
                <span className="t-caption" style={{ color: 'var(--fg-secondary)' }}>{w.title}</span>
              </div>
              <span className="mono t-caption" style={{ textAlign: 'right', color: 'var(--fg-muted)' }}>{getWorldProgress(stats, w.id)}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>TOPIC MASTERY</div>
          {mastery.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Complete lessons and problems to build mastery data.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mastery.slice(0, 8).map(t => (
                <div key={t.topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }} className="t-body-sm"><span style={{ color: 'var(--fg-secondary)' }}>{t.topic}</span><span className="mono" style={{ color: 'var(--fg-muted)' }}>{t.pct}%</span></div>
                  <Progress value={t.pct} tone={t.pct >= 70 ? 'primary' : 'info'} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {strong.map(t => <Chip key={t.topic} tone="success">STRONG · {t.topic.toUpperCase()}</Chip>)}
            {weak.map(t => <Chip key={t.topic} tone="warning">WEAK · {t.topic.toUpperCase()}</Chip>)}
          </div>
        </div>
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>REVISION DUE</div>
          {revision.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Nothing due. Completed lessons return here after 7 days for spaced revision.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {revision.map(r => (
                <Link key={`${r.kind}-${r.id}`} to={r.kind === 'lesson' ? `/learn/lesson/${r.id}` : `/practice/problems/${r.id}`} className="t-body" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-secondary)', padding: '6px 0' }}>
                  <span>{r.title}</span>
                  <span className="t-caption mono" style={{ color: 'var(--warning)' }}>{r.kind === 'lesson' ? `${r.days}d` : 'review'}</span>
                </Link>
              ))}
            </div>
          )}
          <Link to="/practice" className="btn btn-secondary btn-sm" style={{ marginTop: 20 }}>Open Problem Tracker</Link>
        </div>
      </section>
    </>
  );
}
