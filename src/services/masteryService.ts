import { lessons } from '../data/curriculum';
import { getTopicMastery, TopicMastery } from './statsService';
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

export type MasteryState = 'mastered' | 'strong' | 'developing' | 'weak';
export const MASTERY_RANGES = '90–100 mastered · 75–89 strong · 50–74 developing · <50 needs attention';

export function getMasteryState(pct: number): MasteryState {
  if (pct >= 90) return 'mastered';
  if (pct >= 75) return 'strong';
  if (pct >= 50) return 'developing';
  return 'weak';
}

export interface MasteryBreakdown { strongest: TopicMastery[]; attention: TopicMastery[] }

export function getMasteryBreakdown(stats: PlayerStats): MasteryBreakdown {
  const withData = getTopicMastery(stats).filter(t => t.activity > 0);
  const sorted = [...withData].sort((a, b) => b.pct - a.pct);
  return {
    strongest: sorted.slice(0, 3),
    attention: sorted.filter(t => t.pct < 75).sort((a, b) => a.pct - b.pct).slice(0, 3),
  };
}

export interface MasterySnapshot { date: string; topics: Record<string, number> }
// Future: periodic server-side snapshots enable mastery trend deltas.
export function getMasteryHistory(): MasterySnapshot[] { return []; }
export const hasMasteryHistory = (): boolean => getMasteryHistory().length > 0;
