import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { levels, worlds } from '../data/curriculum';
import { getCompletedLevelCount, getLevel, getLevelProgress, getLevelState, getNextLesson, getOverallProgress, getWorldProgress } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Curriculum() {
  const { stats } = usePlayer();
  const [worldFilter, setWorldFilter] = useState<'all' | number>('all');
  const [filter, setFilter] = useState('');
  const next = getNextLesson(stats);
  const currentLevel = next ? getLevel(next.levelId) : undefined;
  const levelsCompleted = getCompletedLevelCount(stats);
  const overall = getOverallProgress(stats);
  const totalHours = useMemo(() => levels.reduce((s, l) => s + l.estimatedHours, 0), []);
  const visibleWorlds = worlds.filter(w => (worldFilter === 'all' || w.number === worldFilter) && levels.some(l => l.worldId === w.id && l.status === 'PUBLISHED'));
  const shown = useMemo(() => levels.filter(l => l.status === 'PUBLISHED' && (filter.trim() === '' || (l.title + l.description).toLowerCase().includes(filter.toLowerCase()))), [filter]);

  return (
    <>
      <section className="cur-head">
        <div>
          <div className="d-eyebrow" style={{ marginBottom: 8 }}>Curriculum Roadmap</div>
          <h1 className="t-hlg">Worlds · Levels · Lessons</h1>
          <p className="d-body" style={{ marginTop: 8 }}>Methodical, systems-first engineering roadmap from fundamental architecture up to production engineering.</p>
        </div>
        <div className="p-strip" style={{ border: '1px solid var(--border-subtle)', borderRadius: 6 }}>
          <div><span className="d-big">{levelsCompleted}</span><span className="lbl">levels completed</span></div>
          <div><span className="d-big">{overall}%</span><span className="lbl">overall progress</span></div>
          <div><span className="d-big">{totalHours}</span><span className="lbl">est. hours</span></div>
        </div>
      </section>

      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${worldFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setWorldFilter('all')}>All worlds</button>
          {worlds.map(w => (
            <button key={w.id} className={`btn btn-sm ${worldFilter === w.number ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setWorldFilter(w.number)} aria-pressed={worldFilter === w.number}>W{w.number}</button>
          ))}
        </div>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Filter levels…" value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter levels" />
      </section>

      {currentLevel && (
        <section className="p-hero">
          <div className="hero-grid">
            <div>
              <div className="d-micro" style={{ color: 'var(--signal-strong, #38BDFB)', marginBottom: 6 }}>
                WORLD {currentLevel.worldId.replace('world-', '')} · LEVEL {currentLevel.number}
              </div>
              <h2 className="d-cardtitle" style={{ marginBottom: 8 }}>{currentLevel.title}</h2>
              <p className="d-body clamp-2">{currentLevel.description}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="d-micro"><span>{getLevelProgress(stats, currentLevel)}%</span></div>
              <div className="hero-bar" style={{ marginTop: 4 }}><div style={{ width: `${getLevelProgress(stats, currentLevel)}%` }} /></div>
            </div>
            <div className="cl-actions">
              <Link className="cta-solid" to={`/learn/level/${currentLevel.id}`}>Resume Study</Link>
            </div>
          </div>
        </section>
      )}

      {visibleWorlds.map(w => {
        const wl = shown.filter(l => l.worldId === w.id);
        if (wl.length === 0) return null;
        return (
          <section key={w.id} className="p-map">
            <div className="p-head">
              <span className="d-title">W{w.number} · {w.title}</span>
              <span className="d-micro">world progress: {getWorldProgress(stats, w.id)}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {wl.map(l => {
                const st = getLevelState(stats, l, next?.levelId ?? null);
                return (
                  <Link key={l.id} to={st === 'locked' ? '#' : `/learn/level/${l.id}`} aria-disabled={st === 'locked'}
                    className="card card-interactive" style={st === 'locked' ? { opacity: .5, cursor: 'not-allowed' } : undefined}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span className="d-micro">LEVEL {l.number}</span>
                      {st === 'done' ? <span className="chip chip-success">done</span>
                        : st === 'current' ? <span className="chip chip-info">current</span>
                        : st === 'locked' ? <span className="chip">locked</span>
                        : <span className="chip">available</span>}
                    </div>
                    <div className="d-title" style={{ marginTop: 8 }}>{l.title}</div>
                    <div className="d-micro" style={{ marginTop: 6 }}>{l.estimatedHours}h · {getLevelProgress(stats, l)}%</div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
