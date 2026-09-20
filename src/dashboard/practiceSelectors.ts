import { getAccuracyMatrix } from '../services/dashboardService';
import { todayKey } from '../services/xpService';
import type { PlayerStats } from '../types';
import { CONTRACTS } from './contracts';
import type { ZoneResult } from './types';

const ready = <T,>(d: T, s: number, t: number): ZoneResult<T> => ({ status: 'ready', data: d, sampleSize: s, threshold: t });
const insufficient = <T,>(s: number, t: number, r: string): ZoneResult<T> => ({ status: 'insufficient', data: null, sampleSize: s, threshold: t, reason: r });
const empty = <T,>(t = 0): ZoneResult<T> => ({ status: 'empty', data: null, sampleSize: 0, threshold: t });

export interface PracticeOverview {
  attempts: number; solved: number; overallAccuracy: number | null;
  firstAttempt: { accuracy: number | null; n: number };
  retry: { accuracy: number | null; n: number };
  avgSolveSeconds: number | null;
}

/* All values from real records: activity submissions/solves, practice tries/correct,
   problem timeSpent. Nothing inferred beyond what is stored. */
export function selectPracticeOverview(stats: PlayerStats): PracticeOverview {
  let attempts = 0, solved = 0;
  for (const k of Object.keys(stats.activity)) {
    const a = stats.activity[k];
    attempts += a?.submissions ?? 0;
    solved += a?.problemsSolved ?? 0;
  }
  const recs = Object.values(stats.practice);
  const firstCorrect = recs.filter(r => r.correct && r.tries === 1).length;
  const retryRecs = recs.filter(r => r.tries > 1);
  const retryCorrect = retryRecs.filter(r => r.correct).length;
  const times = Object.values(stats.problems).filter(p => p.solved && (p.timeSpent ?? 0) > 0).map(p => p.timeSpent);
  return {
    attempts, solved,
    overallAccuracy: attempts > 0 ? Math.round((solved / attempts) * 100) : null,
    firstAttempt: { accuracy: recs.length > 0 ? Math.round((firstCorrect / recs.length) * 100) : null, n: recs.length },
    retry: { accuracy: retryRecs.length > 0 ? Math.round((retryCorrect / retryRecs.length) * 100) : null, n: retryRecs.length },
    avgSolveSeconds: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null,
  };
}

export interface AccuracyPoint { label: string; accuracy: number; submissions: number }
export function selectAccuracyTrend(stats: PlayerStats, weeks = 8): ZoneResult<AccuracyPoint[]> {
  const pts: AccuracyPoint[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
    let sub = 0, sol = 0;
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start); dt.setDate(dt.getDate() + d);
      const a = stats.activity[todayKey(dt)];
      sub += a?.submissions ?? 0; sol += a?.problemsSolved ?? 0;
    }
    if (sub > 0) pts.push({ label: start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), accuracy: Math.round((sol / sub) * 100), submissions: sub });
  }
  if (pts.length === 0) return empty(CONTRACTS.practiceTrend.minAttempts);
  if (pts.length < CONTRACTS.practiceTrend.minAttempts) {
    return insufficient(pts.length, CONTRACTS.practiceTrend.minAttempts, `Needs ${CONTRACTS.practiceTrend.minAttempts} active practice periods (has ${pts.length}).`);
  }
  return ready(pts, pts.length, CONTRACTS.practiceTrend.minAttempts);
}

export interface TopicRow {
  topic: string; attempted: number; solved: number; accuracy: number;
  byDifficulty: Record<'EASY' | 'MEDIUM' | 'HARD', { attempted: number; solved: number } | undefined>;
}
export function selectTopicRows(stats: PlayerStats): TopicRow[] {
  const m = getAccuracyMatrix(stats);
  return m.topics.map(topic => {
    const byDifficulty = { EASY: m.cells[`${topic}||EASY`], MEDIUM: m.cells[`${topic}||MEDIUM`], HARD: m.cells[`${topic}||HARD`] };
    const attempted = (byDifficulty.EASY?.attempted ?? 0) + (byDifficulty.MEDIUM?.attempted ?? 0) + (byDifficulty.HARD?.attempted ?? 0);
    const solved = (byDifficulty.EASY?.solved ?? 0) + (byDifficulty.MEDIUM?.solved ?? 0) + (byDifficulty.HARD?.solved ?? 0);
    return { topic, attempted, solved, accuracy: attempted ? Math.round((solved / attempted) * 100) : 0, byDifficulty };
  });
}
export function selectStrongWeak(stats: PlayerStats) {
  const rows = selectTopicRows(stats).filter(r => r.attempted >= 3);
  return {
    strong: rows.filter(r => r.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy),
    weak: rows.filter(r => r.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy),
  };
}
