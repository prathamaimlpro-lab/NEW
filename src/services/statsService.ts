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
