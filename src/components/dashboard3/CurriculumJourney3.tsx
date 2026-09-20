import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { levels } from '../../data/curriculum';
import { journeyState } from '../../services/dashboardService';
import { useDashboardData } from '../../dashboard/useDashboard';
import { usePlayer } from '../../store/PlayerContext';

export function CurriculumJourney3() {
  const d = useDashboardData();
  const { stats } = usePlayer();
  const nav = useNavigate();
  const journey = d.journey.data;
  const currentWorldId = journey?.currentLevelId ? levels.find(l => l.id === journey.currentLevelId)?.worldId ?? null : null;
  const [open, setOpen] = useState<string | null>(currentWorldId);

  if (!journey) return null;

  return (
    <section className="d3-journey" aria-label="Curriculum journey">
      <div className="d3-journey-head">
        <span className="d3-eyebrow">Curriculum Journey</span>
        <span className="d3-journey-stat">{journey.levelsCompleted}/{journey.totalLevels} levels · {journey.overallPct}%</span>
      </div>
      <div className="d3-lanes">
        {journey.rows.map(row => {
          const wl = levels.filter(l => l.worldId === row.world.id);
          const isOpen = open === row.world.id;
          const isCurrentWorld = row.world.id === currentWorldId;
          return (
            <div key={row.world.id} className={`d3-lane ${isCurrentWorld ? 'current' : ''}`}>
              <button type="button" className="d3-lane-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : row.world.id)}>
                <span>W{row.world.number} · {row.world.title}</span>
                <span className="d3-lane-prog">{row.pct}%</span>
              </button>
              {isOpen && (
                <div className="d3-lane-levels" role="list" aria-label={`${row.world.title} levels`}>
                  {wl.map(l => {
                    const st = journeyState(stats, l.id, journey.currentLevelId);
                    return (
                      <button
                        key={l.id} role="listitem" type="button"
                        className={`d3-node d3-node-${st} ${l.id === journey.currentLevelId ? 'here' : ''}`}
                        onClick={() => nav(`/learn/level/${l.id}`)}
                        aria-label={`Level ${l.number}: ${l.title} (${st})`}
                      >
                        {l.number}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
