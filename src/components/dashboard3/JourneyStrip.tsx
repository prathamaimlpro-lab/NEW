import { useNavigate } from 'react-router-dom';
import { levels } from '../../data/curriculum';
import { useDashboardData } from '../../dashboard/useDashboard';
import { journeyState } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

export function JourneyStrip() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  const nav = useNavigate();
  const j = d.journey.data;
  if (!j) return null;
  const currentWorld = levels.find(l => l.id === j.currentLevelId)?.worldId ?? null;
  const worldLevels = levels.filter(l => l.worldId === currentWorld);

  return (
    <section className="ui-panel" aria-label="Curriculum journey">
      <div className="ui-panel-head"><div className="ui-index">Curriculum Journey</div><span className="ui-mono">{j.levelsCompleted}/{j.totalLevels} levels</span></div>
      <div className="v3-worlds" role="list" aria-label="Worlds">
        {j.rows.map(r => {
          const wl = levels.filter(l => l.worldId === r.world.id);
          const done = wl.filter(l => stats.completedLessons.includes(l.id)).length;
          return (
            <button key={r.world.id} role="listitem" type="button" className={`v3-world ${r.world.id === currentWorld ? 'here' : ''}`} onClick={() => nav('/learn')}>
              <span className="ui-mono">W{r.world.number}</span>
              <span className="v3-world-title">{r.world.title}</span>
              <span className="ui-mono ui-muted">{done}/{wl.length}</span>
            </button>
          );
        })}
      </div>
      <div className="v3-leveldots" role="list" aria-label="Levels in current world">
        {worldLevels.map(l => {
          const st = journeyState(stats, l.id, j.currentLevelId);
          return (
            <button key={l.id} role="listitem" type="button"
              className={`v3-dot v3-dot-${st} ${l.id === j.currentLevelId ? 'here' : ''}`}
              onClick={() => nav(`/learn/level/${l.id}`)}
              aria-label={`Level ${l.number}, ${st}`}>
              {l.number}
            </button>
          );
        })}
      </div>
    </section>
  );
}
