import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heatmap8 } from '../components/dashboard3/Heatmap8';
import '../components/dashboard3/heatmap8.css';
import { selectAnalyticsBandUnits } from '../dashboard/bandSelectors';
import { formatWhen, selectWhatChangedInsights } from '../dashboard/changeSelectors';
import { useDashboardData } from '../dashboard/useDashboard';
import { levels, worlds } from '../data/curriculum';
import { getOverallCompletion, publishedLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/progress7.css';

const tierOf = (m: number) => (m >= 85 ? 'Mastered' : m >= 60 ? 'Solid' : m >= 35 ? 'Learning' : 'Not started');
const WEEK_LABELS: Record<string, string> = {
  velocity: 'Lessons per week',
  consistency: 'Days practiced per week',
  accuracy: 'Practice accuracy',
  revision: 'Revision due',
};

export default function ProgressPage() {
  const { stats } = usePlayer();
  const d = useDashboardData();
  const overall = getOverallCompletion(stats);
  const correct = Object.values(stats.practice).filter(r => r.correct).length;
  const units = useMemo(() => selectAnalyticsBandUnits(stats), [stats]);
  const insights = useMemo(() => selectWhatChangedInsights(stats), [stats]);
  const weekUnits = ['velocity', 'consistency', 'accuracy', 'revision']
    .map(k => units.find(u => u.key === k))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const worldRows = worlds.map(w => {
    const wl = levels.filter(l => l.worldId === w.id);
    const done = wl.filter(l => {
      const ls = publishedLessons(l);
      return ls.length > 0 && ls.every(x => stats.completedLessons.includes(x.id));
    }).length;
    return { w, done, total: wl.length };
  });

  const masteryRows = d.mastery.status === 'ready' && d.mastery.data ? d.mastery.data.rows : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header className="ui-statement">
        <h1 className="ui-h1">Progress</h1>
        <p className="ui-desc">Completion, mastery and practice performance across the whole curriculum.</p>
      </header>

      <div className="pg-tiles">
        <div className="pg-tile"><div className="pg-tile-value">{overall}<span className="ui-kpi-unit">%</span></div><div className="pg-tile-label">Overall</div></div>
        <div className="pg-tile"><div className="pg-tile-value">{stats.completedLessons.length}</div><div className="pg-tile-label">Lessons done</div></div>
        <div className="pg-tile"><div className="pg-tile-value">{correct}</div><div className="pg-tile-label">Questions correct</div></div>
        <div className="pg-tile"><div className="pg-tile-value">{stats.bestStreak}<span className="ui-kpi-unit"> days</span></div><div className="pg-tile-label">Best streak</div></div>
      </div>

      <section className="ui-panel">
        <h2 className="ui-h2">World progress</h2>
        <div className="pg-worlds">
          {worldRows.map(r => (
            <div key={r.w.id} className="pg-world-row">
              <span className="pg-world-name">W{r.w.number} · {r.w.title}</span>
              <span className="hero-bar pg-world-bar" role="progressbar" aria-valuemin={0} aria-valuemax={r.total} aria-valuenow={r.done} aria-label={`${r.w.title}: ${r.done} of ${r.total} levels complete`}>
                <div style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} />
              </span>
              <span className="ui-mono">{r.done}/{r.total}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ui-panel">
        <h2 className="ui-h2">This week</h2>
        <div className="pg-week">
          {weekUnits.map(u => (
            <div key={u.key} className="pg-week-item">
              <span className="pg-week-label">{WEEK_LABELS[u.key]}</span>
              <span className="pg-week-value">{u.value}</span>
              <span className="ui-mono ui-muted">{u.status === 'ready' ? (u.comparison ?? u.seriesLabel) : u.reason}</span>
            </div>
          ))}
        </div>
      </section>

      {masteryRows.length > 0 && (
        <section className="ui-panel">
          <h2 className="ui-h2">Mastery by topic</h2>
          <div className="pg-mrows">
            {masteryRows.map(r => (
              <div key={r.topic} className="pg-mrow">
                <div className="pg-mrow-top">
                  <span className="pg-mrow-topic">{r.topic}</span>
                  <span className="chip">{tierOf(r.mastery)}</span>
                  <span className="ui-mono">{r.mastery}%</span>
                </div>
                <div className="pg-bars">
                  <span className="pg-bar pg-bar-c" aria-hidden="true"><div style={{ width: `${r.completion}%` }} /></span>
                  <span className="pg-bar pg-bar-m" aria-hidden="true"><div style={{ width: `${r.mastery}%` }} /></span>
                </div>
                <div className="pg-mrow-foot">
                  <span>completion {r.completion}%</span>
                  <span>{r.gap > 0 ? `${r.gap} pts behind completion` : 'matches completion'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ui-panel">
        <div className="pg-changed-head">
          <h2 className="ui-h2">What changed</h2>
          {insights.length > 0 && <span className="chip chip-info">{insights.length} recent</span>}
        </div>
        {insights.length === 0 ? (
          <p className="ui-desc">No progress changes yet.</p>
        ) : (
          <div className="pg-changed">
            {insights.map(i => (
              <div key={i.id} className="pg-changed-row">
                <span className="pg-changed-title">{i.title}</span>
                <span className="ui-mono ui-muted">{formatWhen(i.when)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {d.heatmap.status === 'ready' && <Heatmap8 defaultRange="ALL" />}

      <p className="ui-desc">
        Looking for practice details? <Link to="/practice" style={{ color: 'var(--accent)' }}>Open Practice</Link>.
      </p>
    </div>
  );
}
