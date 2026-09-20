import { getMasteryRows } from '../services/dashboardService';
import { getRevisionDue } from '../services/progressService';
import { getRevisionPlan } from '../services/conceptMastery';
import type { PlayerStats } from '../types';
import { CONTRACTS } from './contracts';

export interface BandUnit {
  key: string; label: string; value: string;
  comparison?: string; series: number[]; seriesLabel: string;
  status: 'ready' | 'insufficient' | 'empty'; reason?: string;
}

function weekly(weeks: number, pick: (dayKey: string) => number): number[] {
  const out: number[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
    let sum = 0;
    for (let d = 0; d < 7; d++) { const dt = new Date(start); dt.setDate(dt.getDate() + d); sum += pick(dt.toISOString().slice(0, 10)); }
    out.push(sum);
  }
  return out;
}

export function selectAnalyticsBandUnits(stats: PlayerStats): BandUnit[] {
  const units: BandUnit[] = [];
  const evs = stats.events ?? [];
  const first = stats.firstActiveDate;
  const weeksSince = first ? Math.floor((Date.now() - new Date(`${first}T00:00:00`).getTime()) / (7 * 86400000)) : 0;

  const lessonsPerWeek = weekly(8, k => (stats.lessonCompletedAt[k] ? 1 : 0) + evs.filter(e => e.at.slice(0, 10) === k && e.kind === 'lesson_completed').length);
  if (!first || weeksSince < CONTRACTS.velocity.minWeeks) {
    units.push({ key: 'velocity', label: 'Learning Velocity', value: '—', series: [], seriesLabel: '', status: 'insufficient', reason: `Needs ${CONTRACTS.velocity.minWeeks} weeks of history.` });
  } else {
    const avg = +(stats.completedLessons.length / Math.max(1, weeksSince)).toFixed(1);
    const cur = lessonsPerWeek[lessonsPerWeek.length - 1] ?? 0;
    const prev = lessonsPerWeek[lessonsPerWeek.length - 2] ?? 0;
    units.push({ key: 'velocity', label: 'Learning Velocity', value: `${avg} lessons/wk`, comparison: `this wk ${cur} vs last ${prev}`, series: lessonsPerWeek, seriesLabel: 'lessons per week', status: 'ready' });
  }

  const rows = getMasteryRows(stats);
  if (rows.length === 0) {
    units.push({ key: 'mastery', label: 'Mastery', value: '—', series: [], seriesLabel: '', status: 'empty', reason: 'No mastery evidence yet.' });
  } else {
    const avg = Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length);
    const gap = Math.round(rows.reduce((s, r) => s + r.gap, 0) / rows.length);
    units.push({ key: 'mastery', label: 'Mastery', value: `${avg}%`, comparison: `gap to completion ${gap >= 0 ? '+' : ''}${gap} pts`, series: rows.map(r => r.mastery), seriesLabel: 'mastery by topic', status: 'ready' });
  }

  const activeDays = weekly(8, k => (stats.activity[k]?.count ?? 0) > 0 ? 1 : 0);
  const totalActive = activeDays.reduce((a, b) => a + b, 0);
  if (totalActive === 0) {
    units.push({ key: 'consistency', label: 'Consistency', value: '—', series: [], seriesLabel: '', status: 'empty', reason: 'No active days yet.' });
  } else {
    const cur = activeDays[activeDays.length - 1] ?? 0;
    const prev = activeDays[activeDays.length - 2] ?? 0;
    units.push({ key: 'consistency', label: 'Consistency', value: `${+(totalActive / Math.max(1, weeksSince || 1)).toFixed(1)} days/wk`, comparison: `this wk ${cur} vs last ${prev}`, series: activeDays, seriesLabel: 'active days per week', status: 'ready' });
  }

  const submissions = Object.values(stats.problems).reduce((s, r) => s + r.attempts, 0);
  const solved = Object.values(stats.problems).filter(r => r.solved).length;
  const solvesPerWeek = weekly(8, k => evs.filter(e => e.at.slice(0, 10) === k && e.kind === 'problem_solved').length);
  if (submissions === 0) {
    units.push({ key: 'accuracy', label: 'Practice Accuracy', value: '—', series: [], seriesLabel: '', status: 'empty', reason: 'No practice attempts yet.' });
  } else {
    const acc = Math.round((solved / Math.max(1, submissions)) * 100);
    const solvedEvents = evs.filter(e => e.kind === 'problem_solved').length;
    const cur = solvesPerWeek[solvesPerWeek.length - 1] ?? 0;
    const prev = solvesPerWeek[solvesPerWeek.length - 2] ?? 0;
    units.push({
      key: 'accuracy', label: 'Practice Accuracy', value: `${acc}%`,
      comparison: solvedEvents >= CONTRACTS.practiceTrend.minAttempts ? `solves this wk ${cur} vs last ${prev}` : undefined,
      series: solvesPerWeek, seriesLabel: 'solves per week', status: 'ready',
    });
  }

  const due = getRevisionDue(stats);
  const plan = getRevisionPlan(stats);
  if (stats.completedLessons.length === 0 && plan.length === 0) {
    units.push({ key: 'revision', label: 'Revision Load', value: '—', series: [], seriesLabel: '', status: 'empty', reason: 'Nothing scheduled yet.' });
  } else {
    units.push({
      key: 'revision', label: 'Revision Load', value: `${due.length + plan.length} due`,
      series: [due.filter(d => d.kind === 'lesson').length, due.filter(d => d.kind === 'problem').length, plan.length],
      seriesLabel: 'lessons / problems / concepts due', status: 'ready',
    });
  }
  return units;
}
