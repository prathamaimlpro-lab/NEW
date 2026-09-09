import { lessons } from '../data/curriculum';
import { PlayerStats } from '../types';

export interface TopicCompletion { topic: string; completed: number; total: number; pct: number }

export function getTopicCompletion(stats: PlayerStats): TopicCompletion[] {
  const tally: Record<string, { completed: number; total: number }> = {};
  for (const lesson of Object.values(lessons).filter(l => l.status === 'PUBLISHED')) {
    for (const t of lesson.topics) {
      tally[t] = tally[t] ?? { completed: 0, total: 0 };
      tally[t].total += 1;
      if (stats.completedLessons.includes(lesson.id)) tally[t].completed += 1;
    }
  }
  return Object.entries(tally)
    .map(([topic, v]) => ({ topic, completed: v.completed, total: v.total, pct: v.total ? Math.round((v.completed / v.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);
}

export interface MasterySnapshot { date: string; topics: Record<string, number> }

// Future: periodic server-side mastery snapshots enable trend deltas (+x% this month).
// Until snapshots exist, trends must remain hidden — never fabricated.
export function getMasteryHistory(): MasterySnapshot[] { return []; }
export const hasMasteryHistory = (): boolean => getMasteryHistory().length > 0;
