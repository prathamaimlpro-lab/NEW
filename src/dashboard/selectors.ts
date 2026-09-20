import { getHeatmapDays } from '../services/activityService';
import {
  getAccuracyMatrix, getActivitySeries, getCurrentLearningState, getCurriculumProgress, getMasteryRows,
  getProjectRows, getRankedAction, getSolvedSparkline, getStrengthEvidence, getVisualizationRows,
  getWeaknessEvidence, type Range,
} from '../services/dashboardService';
import { getOverallCompletion, getRevisionDue } from '../services/progressService';
import { buildSkillGraph } from '../services/skillService';
import { getRevisionPlan } from '../services/conceptMastery';
import { todayKey } from '../services/xpService';
import type { PlayerStats } from '../types';
import { CONTRACTS } from './contracts';
import type { LearnerStage, ZoneResult } from './types';

const ready = <T,>(data: T, sample: number, threshold: number): ZoneResult<T> =>
  ({ status: 'ready', data, sampleSize: sample, threshold });
const insufficient = (sample: number, threshold: number, reason: string): ZoneResult<never> =>
  ({ status: 'insufficient', data: null, sampleSize: sample, threshold, reason });
const empty = (threshold = 0): ZoneResult<never> =>
  ({ status: 'empty', data: null, sampleSize: 0, threshold });

export function classifyLearner(stats: PlayerStats): LearnerStage {
  const events = (stats.events ?? []).length;
  const lessons = stats.completedLessons.length;
  if (events === 0 && lessons === 0) return 'day0';
  if (lessons < 3) return 'early';
  return getOverallCompletion(stats) < 40 ? 'developing' : 'advanced';
}

export function selectContinueLearning(stats: PlayerStats) {
  const state = getCurrentLearningState(stats);
  return state ? ready(state, 1, CONTRACTS.structural.minActivity) : empty();
}

export function selectNextBestAction(stats: PlayerStats) {
  const action = getRankedAction(stats, null);
  return action ? ready(action, 1, CONTRACTS.structural.minActivity) : empty();
}

export function selectAnalyticsBand(stats: PlayerStats) {
  return ready({
    xp: stats.xp, level: stats.level, streak: stats.streak,
    todayMinutes: stats.activity[todayKey()]?.minutes ?? 0,
    lessonsCompleted: stats.completedLessons.length,
  }, 1, CONTRACTS.structural.minActivity);
}

export function selectLearningActivity(stats: PlayerStats, range: Range = '30D') {
  const series = getActivitySeries(stats, range);
  if (series.events === 0) return empty(1);
  return ready(series, series.events, 1);
}

export function selectMasteryAnalytics(stats: PlayerStats) {
  const rows = getMasteryRows(stats);
  if (rows.length === 0) return empty(CONTRACTS.mastery.minActivity);
  const avg = Math.round(rows.reduce((s, r) => s + r.mastery, 0) / rows.length);
  const completion = getOverallCompletion(stats);
  return ready({ rows, avg, completion, gap: completion - avg }, rows.length, CONTRACTS.mastery.minActivity);
}

export function selectPracticeAnalytics(stats: PlayerStats) {
  const matrix = getAccuracyMatrix(stats);
  const totalAttempts = Object.values(matrix.cells).reduce((s, c) => s + c.attempted, 0);
  const submissions = Object.values(stats.problems).reduce((s, r) => s + r.attempts, 0);
  const solvedEvents = (stats.events ?? []).filter(e => e.kind === 'problem_solved').length;

  const matrixZone = totalAttempts >= CONTRACTS.practiceMatrix.minAttempts
    ? ready(matrix, totalAttempts, CONTRACTS.practiceMatrix.minAttempts)
    : submissions > 0
      ? insufficient(totalAttempts, CONTRACTS.practiceMatrix.minAttempts, `Needs ${CONTRACTS.practiceMatrix.minAttempts} total attempts (has ${totalAttempts}).`)
      : empty(CONTRACTS.practiceMatrix.minAttempts);

  const spark = getSolvedSparkline(stats);
  const trendZone = solvedEvents >= CONTRACTS.practiceTrend.minAttempts
    ? ready(spark, solvedEvents, CONTRACTS.practiceTrend.minAttempts)
    : insufficient(solvedEvents, CONTRACTS.practiceTrend.minAttempts, `Needs ${CONTRACTS.practiceTrend.minAttempts} solved problems (has ${solvedEvents}).`);

  const attempted = Object.values(stats.problems).length;
  const solved = Object.values(stats.problems).filter(r => r.solved).length;
  const summaryZone = submissions > 0
    ? ready({ attempted, solved, success: Math.round((solved / Math.max(1, submissions)) * 100) }, submissions, 1)
    : empty(1);

  return { matrix: matrixZone, trend: trendZone, summary: summaryZone };
}

export function selectKnowledgeGraph(stats: PlayerStats) {
  const graph = buildSkillGraph(stats);
  if (graph.nodes.length === 0) return empty(CONTRACTS.structural.minActivity);
  const activeNodes = graph.nodes.filter(n => n.hasData).length;
  return ready({ graph, activeNodes }, graph.nodes.length, CONTRACTS.structural.minActivity);
}

export function selectCurriculumJourney(stats: PlayerStats) {
  const prog = getCurriculumProgress(stats);
  return ready(prog, prog.totalLevels, CONTRACTS.structural.minActivity);
}

export function selectWeaknessIntelligence(stats: PlayerStats) {
  const all = getWeaknessEvidence(stats);
  const qualified = all.filter(w => w.attempts >= CONTRACTS.weakness.minAttemptsPerTopic);
  if (qualified.length) return ready(qualified, qualified.reduce((s, w) => s + w.attempts, 0), CONTRACTS.weakness.minAttemptsPerTopic);
  if (all.length) {
    const max = Math.max(...all.map(w => w.attempts));
    return insufficient(max, CONTRACTS.weakness.minAttemptsPerTopic, `Topics need ≥${CONTRACTS.weakness.minAttemptsPerTopic} attempts before weakness is reliable.`);
  }
  return empty(CONTRACTS.weakness.minAttemptsPerTopic);
}

export function selectStrengthIntelligence(stats: PlayerStats) {
  const all = getStrengthEvidence(stats);
  const qualified = all.filter(w => w.attempts >= CONTRACTS.strength.minAttemptsPerTopic);
  if (qualified.length) return ready(qualified, qualified.reduce((s, w) => s + w.attempts, 0), CONTRACTS.strength.minAttemptsPerTopic);
  if (all.length) {
    const max = Math.max(...all.map(w => w.attempts));
    return insufficient(max, CONTRACTS.strength.minAttemptsPerTopic, `Topics need ≥${CONTRACTS.strength.minAttemptsPerTopic} attempts before strength is reliable.`);
  }
  return empty(CONTRACTS.strength.minAttemptsPerTopic);
}

export function selectRevisionQueue(stats: PlayerStats) {
  const due = getRevisionDue(stats);
  const conceptPlan = getRevisionPlan(stats);
  const count = due.length + conceptPlan.length;
  if (count > 0) return ready({ due, conceptPlan }, count, CONTRACTS.revisionRisk.minCompletedCycles);
  return empty(CONTRACTS.revisionRisk.minCompletedCycles);
}

export function selectWhatChanged(stats: PlayerStats) {
  const evs = stats.events ?? [];
  if (evs.length === 0) return empty(1);
  const cutoff = Date.now() - 48 * 3600000;
  const recent = evs.filter(e => new Date(e.at).getTime() >= cutoff);
  if (recent.length === 0) return empty(1);
  return ready(recent.slice(-12).reverse(), recent.length, 1);
}

export function selectProjectAnalytics(stats: PlayerStats) {
  const rows = getProjectRows(stats);
  if (rows.length === 0) return empty(1);
  const done = rows.filter(r => r.done).length;
  return ready({ rows, done }, rows.length, 1);
}

export function selectVisualizationActivity(stats: PlayerStats) {
  const rows = getVisualizationRows(stats);
  if (rows.length === 0) return empty(1);
  const used = rows.filter(r => r.lastIso).length;
  return ready({ rows, used }, rows.length, 1);
}

export function selectLearningHeatmap(stats: PlayerStats) {
  const days = getHeatmapDays(stats);
  const total = days.reduce((s, d) => s + d.value, 0);
  if (total === 0) return empty(1);
  return ready({ days, total }, total, 1);
}

export function selectLearningVelocity(stats: PlayerStats) {
  if (!stats.firstActiveDate) return empty(CONTRACTS.velocity.minWeeks);
  const weeks = Math.floor((Date.now() - new Date(`${stats.firstActiveDate}T00:00:00`).getTime()) / (7 * 86400000));
  if (weeks < CONTRACTS.velocity.minWeeks) {
    return insufficient(weeks, CONTRACTS.velocity.minWeeks, `Needs ${CONTRACTS.velocity.minWeeks} weeks of history (has ${weeks}).`);
  }
  const solves = (stats.events ?? []).filter(e => e.kind === 'problem_solved').length;
  return ready({
    weeks,
    lessonsPerWeek: +(stats.completedLessons.length / weeks).toFixed(2),
    practicePerWeek: +(solves / weeks).toFixed(2),
  }, weeks, CONTRACTS.velocity.minWeeks);
}
