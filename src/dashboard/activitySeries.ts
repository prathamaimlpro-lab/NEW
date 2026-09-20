import { todayKey } from '../services/xpService';
import type { PlayerStats } from '../types';

export type ActivityRange = '7D' | '30D' | '90D' | '1Y';
export type ActivitySeriesKey = 'lessons' | 'practice' | 'revision' | 'projects' | 'visualizations';

export interface ActivityBucket {
  label: string; showLabel: boolean;
  lessons: number; practice: number; revision: number; projects: number; visualizations: number; total: number;
}

const RANGE_DAYS: Record<ActivityRange, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 364 };
const bucketSize = (r: ActivityRange) => (r === '90D' ? 7 : r === '1Y' ? 28 : 1);

/* Authoritative multi-series activity aggregation (daily buckets for 7D/30D,
   weekly/4-weekly buckets for 90D/1Y). Real records only. */
export function buildActivitySeries(stats: PlayerStats, range: ActivityRange): { buckets: ActivityBucket[]; events: number; minutes: number } {
  const per = bucketSize(range);
  const count = Math.round(RANGE_DAYS[range] / per);
  const evs = stats.events ?? [];
  const buckets: ActivityBucket[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const end = new Date(); end.setDate(end.getDate() - i * per);
    let lessons = 0, practice = 0, revision = 0, projects = 0, visualizations = 0;
    for (let dd = 0; dd < per; dd++) {
      const dt = new Date(end); dt.setDate(dt.getDate() - dd);
      const k = todayKey(dt);
      const day = evs.filter(e => e.at.slice(0, 10) === k);
      const evLessons = day.filter(e => e.kind === 'lesson_completed').length;
      lessons += evLessons > 0 ? evLessons : (stats.lessonCompletedAt[k] ? 1 : 0);
      practice += stats.activity[k]?.problemsSolved ?? 0;
      revision += day.filter(e => e.kind === 'revision_completed').length;
      projects += day.filter(e => e.kind === 'project_completed').length;
      visualizations += day.filter(e => e.kind === 'visualization_completed').length;
    }
    const showLabel = range === '7D' ? true : range === '30D' ? i % 5 === 0 : range === '90D' ? i % 2 === 0 : true;
    buckets.push({
      label: end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), showLabel,
      lessons, practice, revision, projects, visualizations,
      total: lessons + practice + revision + projects + visualizations,
    });
  }

  let events = 0, minutes = 0;
  for (let i = 0; i < RANGE_DAYS[range]; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const a = stats.activity[todayKey(dt)];
    events += a?.count ?? 0; minutes += a?.minutes ?? 0;
  }
  return { buckets, events, minutes };
}
