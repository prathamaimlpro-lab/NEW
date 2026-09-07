import { lessons } from '../data/curriculum';
import { problems } from '../data/problems';
import { Difficulty, PlayerStats } from '../types';

export function getCodingStats(stats: PlayerStats) {
  const recs = Object.entries(stats.problems ?? {});
  const solvedIds = recs.filter(([, r]) => r.solved).map(([id]) => id);
  const byDiff = (d: Difficulty) => solvedIds.filter(id => problems.find(p => p.id === id)?.difficulty === d).length;
  const easy = byDiff('EASY'), medium = byDiff('MEDIUM'), hard = byDiff('HARD');
  const solved = solvedIds.length;
  const submissions = recs.reduce((s, [, r]) => s + r.attempts, 0);
  const acceptance = submissions ? Math.round((solved / submissions) * 100) : 0;
  const codingXp = solvedIds.reduce((s, id) => s + (problems.find(p => p.id === id)?.xp ?? 0), 0);
  const rating = 400 + easy * 10 + medium * 20 + hard * 40;
  return { solved, easy, medium, hard, submissions, acceptance, codingXp, rating };
}

export interface TopicMastery { topic: string; pct: number; activity: number }

export function getTopicMastery(stats: PlayerStats): TopicMastery[] {
  const tally: Record<string, { score: number; total: number }> = {};
  const add = (t: string, score: number, total: number) => {
    tally[t] = tally[t] ?? { score: 0, total: 0 };
    tally[t].score += score; tally[t].total += total;
  };
  for (const lesson of Object.values(lessons).filter(l => l.status === 'PUBLISHED')) {
    for (const t of lesson.topics) {
      add(t, stats.completedLessons.includes(lesson.id) ? 2 : 0, 2);
      for (const q of [...lesson.practice, ...lesson.masteryTest]) add(t, stats.practice[q.id]?.correct ? 1 : 0, 1);
    }
  }
  for (const p of problems.filter(x => x.status === 'PUBLISHED')) {
    for (const t of p.topics) add(t, stats.problems[p.id]?.solved ? 2 : 0, 2);
  }
  return Object.entries(tally)
    .map(([topic, v]) => ({ topic, pct: v.total ? Math.round((v.score / v.total) * 100) : 0, activity: v.total }))
    .sort((a, b) => b.pct - a.pct || b.activity - a.activity);
}

export function getOverallMastery(stats: PlayerStats): number {
  const list = getTopicMastery(stats);
  const total = list.reduce((s, t) => s + t.total, 0);
  if (total === 0) return 0;
  const score = list.reduce((s, t) => s + (t.pct / 100) * t.activity, 0);
  return Math.round((score / total) * 100);
}

export function getProblemTopicProgress(stats: PlayerStats) {
  const topics = [...new Set(problems.flatMap(p => p.topics))];
  return topics.map(t => {
    const all = problems.filter(p => p.topics.includes(t));
    const solved = all.filter(p => stats.problems[p.id]?.solved).length;
    return { topic: t, solved, total: all.length };
  }).filter(x => x.total > 0);
}
