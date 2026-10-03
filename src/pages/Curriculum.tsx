import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { levels, worlds } from '../data/curriculum';
import { getCurrentLearningState, journeyState } from '../services/dashboardService';
import { getOverallCompletion, publishedLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import '../styles/curriculum.css';

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

type LevelState = 'done' | 'current' | 'available' | 'locked';

export default function Curriculum() {
  const { stats } = usePlayer();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const cont = getCurrentLearningState(stats);
  const overall = getOverallCompletion(stats);

  const currentLevel = useMemo(() => {
    if (!cont) return undefined;
    const byId = levels.find(l => l.id === (cont as any).levelId);
    if (byId) return byId;
    return levels.find(l => publishedLessons(l).some(p => p.id === cont.lessonId));
  }, [cont]);

  const stateOf = (levelId: string): LevelState => journeyState(stats, levelId, currentLevel?.id ?? null);

  const worldInfo = useMemo(() => new Map(worlds.map(w => {
    const wl = levels.filter(l => l.worldId === w.id);
    const states = wl.map(l => stateOf(l.id));
    const done = states.filter(s => s === 'done').length;
    const withLessons = wl.filter(l => publishedLessons(l).length > 0);
    const complete = withLessons.length > 0 && withLessons.every(l => stateOf(l.id) === 'done');
    const locked = wl.length > 0 && states.every(s => s === 'locked');
    const status = complete ? 'complete' : locked ? 'locked' : 'progress';
    return [w.id, { total: wl.length, done, status }] as const;
  })), [stats, currentLevel]);

  const q = query.trim().toLowerCase();
  const visibleWorlds = worlds.filter(w => {
    if (!q) return true;
    const wl = levels.filter(l => l.worldId === w.id);
    return w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || wl.some(l => l.title.toLowerCase().includes(q));
  });

  const selectedWorld = worlds.find(w => w.id === selected);

  return (
    <div className="cur-page">
      <header className="ui-statement">
        <h1 className="ui-h1">Curriculum</h1>
        <p className="ui-desc">{worlds.length} worlds · {levels.length} levels. Open a world to see its levels, prerequisites and milestones.</p>
      </header>

      <div className="cur-head">
        <div className="cur-head-main">
          <span className="ui-index">Current</span>
          <span className="cur-head-title">
            {currentLevel ? `World ${worlds.find(w => w.id === currentLevel.worldId)?.number} · Level ${currentLevel.number}` : 'World 1'}
          </span>
          <div className="hero-bar cur-head-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} aria-label="Overall curriculum progress">
            <div style={{ width: `${overall}%` }} />
          </div>
        </div>
        <Link className="btn btn-primary cur-continue" to={cont ? `/learn/lesson/${cont.lessonId}` : '/learn/level/level-1'}>
          Continue
        </Link>
      </div>

      <label className="cur-search">
        <span className="sr-only">Search levels or worlds</span>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search levels or worlds" />
      </label>

      {selectedWorld && (
        <section className="cur-levels" id={`world-${selectedWorld.id}-levels`} aria-label={`Levels in ${selectedWorld.title}`}>
          <div className="cur-levels-head">
            <button type="button" className="btn btn-ghost btn-sm cur-back" onClick={() => setSelected(null)}>← All worlds</button>
            <h2 className="ui-h2">{selectedWorld.title}</h2>
          </div>
          {levels.filter(l => l.worldId === selectedWorld.id).map((l, i) => {
            const st = stateOf(l.id);
            const ls = publishedLessons(l);
            const first = ls[0];
            const prevNumber = levels[i - 1]?.number;
            const hint = st === 'done' ? 'Completed'
              : st === 'locked' ? `Finish Level ${prevNumber} to unlock`
              : st === 'current' ? `Ready now${first ? `, about ${first.estimatedMinutes} min, +${first.xpReward} XP` : ''}`
              : ls.length ? `${ls.length} lessons${first ? ` · about ${first.estimatedMinutes} min` : ''}` : 'No lessons published yet';
            return (
              <Link key={l.id} className={`cur-row cur-row-${st}`} to={`/learn/level/${l.id}`} aria-disabled={st === 'locked'}>
                <span className="cur-num" aria-hidden="true">{l.number}</span>
                <span className="cur-row-main">
                  <span className="cur-row-title">{l.title}</span>
                  <span className="cur-row-hint">{hint}</span>
                </span>
                {st === 'locked' ? <span className="cur-lock"><LockIcon /> Locked</span>
                  : st === 'current' ? <span className="chip chip-warning">Start</span>
                  : st === 'done' ? <span className="chip chip-success">Done</span>
                  : <span className="chip">Ready</span>}
              </Link>
            );
          })}
        </section>
      )}

      <div className="cur-grid">
        {visibleWorlds.map(w => {
          const info = worldInfo.get(w.id)!;
          return (
            <button key={w.id} type="button" className="cur-card"
              aria-controls={`world-${w.id}-levels`} aria-expanded={selected === w.id}
              onClick={() => setSelected(selected === w.id ? null : w.id)}>
              <div className="cur-card-top">
                <span className="ui-index">World {w.number}</span>
                <span className={`chip ${info.status === 'complete' ? 'chip-success' : info.status === 'progress' ? 'chip-warning' : ''}`}>
                  {info.status === 'complete' ? 'Complete' : info.status === 'progress' ? 'In progress' : 'Locked'}
                </span>
              </div>
              <div className="cur-card-title">{w.title}</div>
              <p className="cur-card-desc">{w.description}</p>
              <div className="hero-bar" aria-hidden="true"><div style={{ width: `${info.total ? (info.done / info.total) * 100 : 0}%` }} /></div>
              <div className="ui-mono">{info.done}/{info.total} levels</div>
            </button>
          );
        })}
        {visibleWorlds.length === 0 && <div className="dempty">No worlds match "{query}". Try a different search.</div>}
      </div>
    </div>
  );
}
