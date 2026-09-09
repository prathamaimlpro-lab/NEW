import { useMemo } from 'react';
import { getSettings } from '../../services/contentStore';
import { getTierName } from '../../services/xpService';
import { todayKey } from '../../services/xpService';
import { usePlayer } from '../../store/PlayerContext';

export function CompactStrip() {
  const { stats } = usePlayer();
  const goal = getSettings().dailyGoalMinutes;
  const todayMin = stats.activity[todayKey()]?.minutes ?? 0;
  const items = useMemo(() => [
    { value: `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`, label: 'streak' },
    { value: `${stats.xp.toLocaleString()} XP`, label: `Level ${stats.level} ${getTierName(stats.level)}` },
    { value: `${todayMin}/${goal} min`, label: 'today' },
    { value: `${stats.completedLessons.length}`, label: 'lessons completed' },
  ], [stats, goal, todayMin]);
  return (
    <div className="p-strip" role="group" aria-label="Key metrics">
      {items.map(it => (
        <div key={it.label}>
          <span className="d-big">{it.value}</span>
          <span className="lbl">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
