import { listVisualizations } from '../components/visualization/registry';
import { levels, worlds } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import {
  getCompletedLevelCount, getLevel, getLessonProgress, getLevelProgress, getNextLesson,
  getOverallCompletion, getOverallProgress, getWorld, getWorldProgress, isLevelCompleted, publishedLessons,
} from './progressService';
import { getTopicMastery } from './statsService';
import { getTopicCompletion } from './masteryService';
import { todayKey } from './xpService';
import type { PlayerStats } from '../types';

export { getLevelState as journeyState } from './progressService';

/* ---------- documented intelligence thresholds ---------- */
export const WEAK_RULE = { minAttempts: 3, masteryBelow: 50, accuracyBelow: 60 } as const;
export const STRONG_RULE = { minAttempts: 3, masteryAtLeast: 75, accuracyAtLeast: 80 } as const;

export interface CurrentLearningState {
  lessonId: string; levelId: string; worldNumber: number; worldTitle: string;
  levelNumber: number; levelTitle: string; lessonTitle: string;
  lessonIndex: number; lessonCount: number; lessonProgress: number; levelProgress: number;
  minutesRemaining: number; xp: number; begun: boolean; lastActivityIso: string | null;
}

export function relTime(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function lastEventIso(stats: PlayerStats): string | null {
  const evs = stats.events ?? [];
  if (!evs.length) return null;
  return evs.map(e => e.at).sort()[evs.length - 1];
}

export function getCurrentLearningState(stats: PlayerStats): CurrentLearningState | null {
  const next = getNextLesson(stats);
  if (!next) return null;
  const level = getLevel(next.levelId);
  if (!level) return null;
  const world = getWorld(level.worldId);
  const list = publishedLessons(level);
  const idx = list.findIndex(l => l.id === next.id);
  const prog = getLessonProgress(stats, next);
  const begun = prog > 0 || stats.completedLessons.length > 0 || (stats.events ?? []).length > 0;
  return {
    lessonId: next.id, levelId: level.id, worldNumber: world?.number ?? 0, worldTitle: world?.title ?? '',
    levelNumber: level.number, levelTitle: level.title, lessonTitle: next.title,
    lessonIndex: idx + 1, lessonCount: list.length, lessonProgress: prog, levelProgress: getLevelProgress(stats, level),
    minutesRemaining: Math.max(0, Math.round(next.estimatedMinutes * (1 - prog / 100))),
    xp: next.xpReward, begun, lastActivityIso: lastEventIso(stats),
  };
}

/* ---------- activity series (4 honest series) ---------- */
export type Range = '7D' | '30D' | '90D' | '1Y';
export interface SeriesDay { date: string; label: string; showLabel: boolean; lessons: number; practice: number; revision: number; other: number; total: number }

const RANGE_TOTAL: Record<Range, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 364 };

export function getActivitySeries(stats: PlayerStats, range: Range): { days: SeriesDay[]; events: number; minutes: number } {
  const per = range === '90D' ? 7 : range === '1Y' ? 28 : 1;
  const count = Math.round(RANGE_TOTAL[range] / per);
  const evs = stats.events ?? [];
  const days: SeriesDay[] = [];
  let events = 0, minutes = 0;
  for (let i = count - 1; i >= 0; i--) {
    const end = new Date(); end.setDate(end.getDate() - i * per);
    let lessonsN = 0, practiceN = 0, revisionN = 0, otherN = 0;
    for (let d = 0; d < per; d++) {
      const dt = new Date(end); dt.setDate(dt.getDate() - d);
      const k = todayKey(dt);
      const dayEvs = evs.filter(e => e.at.slice(0, 10) === k);
      const evLessons = dayEvs.filter(e => e.kind === 'lesson_completed').length;
      lessonsN += evLessons > 0 ? evLessons : (stats.lessonCompletedAt[k] ? 1 : 0);
      practiceN += stats.activity[k]?.problemsSolved ?? 0;
      revisionN += dayEvs.filter(e => e.kind === 'revision_completed').length;
      otherN += dayEvs.filter(e => e.kind === 'visualization_completed' || e.kind === 'project_completed').length;
    }
    const showLabel = range === '7D' ? true : range === '30D' ? i % 5 === 0 : range === '90D' ? i % 2 === 0 : true;
    days.push({ date: todayKey(end), label: end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), showLabel, lessons: lessonsN, practice: practiceN, revision: revisionN, other: otherN, total: lessonsN + practiceN + revisionN + otherN });
  }
  for (let i = 0; i < RANGE_TOTAL[range]; i++) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const a = stats.activity[todayKey(dt)];
    events += a?.count ?? 0; minutes += a?.minutes ?? 0;
  }
  return { days, events, minutes };
}

/* ---------- mastery vs completion ---------- */
export interface MasteryRow { topic: string; mastery: number; completion: number; gap: number; accuracy: number | null; attempts: number }

function topicAgg(stats: PlayerStats, topic: string): { attempted: number; solved: number; last: string | null } {
  let attempted = 0, solved = 0; let last: string | null = null;
  for (const p of problems) {
    if (!p.topics.includes(topic)) continue;
    const r = stats.problems[p.id];
    if (!r) continue;
    attempted += 1;
    if (r.solved) solved += 1;
    if (r.lastAttempted && (!last || r.lastAttempted > last)) last = r.lastAttempted;
  }
  return { attempted, solved, last };
}

export function getMasteryRows(stats: PlayerStats): MasteryRow[] {
  const mastery = new Map(getTopicMastery(stats).map(t => [t.topic, t]));
  const completion = new Map(getTopicCompletion(stats).map(t => [t.topic, t]));
  const rows: MasteryRow[] = [];
  for (const [topic, m] of mastery) {
    if (m.activity <= 0) continue;
    const c = completion.get(topic)?.pct ?? 0;
    const agg = topicAgg(stats, topic);
    rows.push({ topic, mastery: m.pct, completion: c, gap: c - m.pct, accuracy: agg.attempted >= 1 ? Math.round((agg.solved / agg.attempted) * 100) : null, attempts: agg.attempted });
  }
  return rows.sort((a, b) => b.mastery - a.mastery);
}

/* ---------- weakness / strength evidence ---------- */
export interface TopicEvidence { topic: string; mastery: number; accuracy: number; attempts: number; lastDays: number | null; lines: string[] }

function daysAgo(date: string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000);
}

export function getWeaknessEvidence(stats: PlayerStats): TopicEvidence[] {
  const out: TopicEvidence[] = [];
  for (const row of getMasteryRows(stats)) {
    if (row.attempts < WEAK_RULE.minAttempts) continue;
    if (row.mastery >= WEAK_RULE.masteryBelow) continue;
    if (row.accuracy === null || row.accuracy >= WEAK_RULE.accuracyBelow) continue;
    const ld = daysAgo(topicAgg(stats, row.topic).last);
    out.push({
      topic: row.topic, mastery: row.mastery, accuracy: row.accuracy, attempts: row.attempts, lastDays: ld,
      lines: [
        `Recent accuracy: ${row.accuracy}% (${row.attempts} attempts)`,
        `Mastery: ${row.mastery}%`,
        ld === null ? 'Last practiced: —' : `Last practiced: ${ld} days ago`,
      ],
    });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
}

export function getStrengthEvidence(stats: PlayerStats): TopicEvidence[] {
  const out: TopicEvidence[] = [];
  for (const row of getMasteryRows(stats)) {
    if (row.attempts < STRONG_RULE.minAttempts) continue;
    if (row.mastery < STRONG_RULE.masteryAtLeast) continue;
    if (row.accuracy === null || row.accuracy < STRONG_RULE.accuracyAtLeast) continue;
    out.push({
      topic: row.topic, mastery: row.mastery, accuracy: row.accuracy, attempts: row.attempts, lastDays: daysAgo(topicAgg(stats, row.topic).last),
      lines: [
        `Recent accuracy: ${row.accuracy}% (${row.attempts} attempts)`,
        `Mastery: ${row.mastery}%`,
        `${row.attempts} consistent applications`,
      ],
    });
  }
  return out.sort((a, b) => b.mastery - a.mastery).slice(0, 3);
}

/* ---------- ranked next-best-action (first match wins) ---------- */
export interface RankedAction { headline: string; why: string; to: string; accent: 'strong' | 'weak' }

function getRevisionTopics(stats: PlayerStats): string[] {
  const out: string[] = [];
  for (const [id, date] of Object.entries(stats.lessonCompletedAt)) {
    const days = Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000);
    if (days >= 7) out.push(...(lessons[id]?.topics ?? []));
  }
  return out;
}

export function getRankedAction(stats: PlayerStats): RankedAction {
  const state = getCurrentLearningState(stats);
  if (state && state.lessonProgress > 0 && state.lessonProgress < 100) {
    return { headline: `Finish ${state.lessonTitle}`, why: `Rule 1 — you are ${state.lessonProgress}% through this lesson; finishing it keeps Level ${state.levelNumber} moving.`, to: `/learn/lesson/${state.lessonId}`, accent: 'strong' };
  }
  const rows = getMasteryRows(stats);
  const practicedRecently = (r: MasteryRow) => { const ld = daysAgo(topicAgg(stats, r.topic).last); return ld !== null && ld <= 14; };
  const review = rows.find(r => r.mastery < 50 && practicedRecently(r));
  if (review) {
    return { headline: `Review ${review.topic}`, why: `Rule 2 — mastery on ${review.topic} is ${review.mastery}% and you practiced it within the last 14 days.`, to: '/practice', accent: 'weak' };
  }
  const revisionTopics = new Set(getRevisionTopics(stats));
  const weak = getWeaknessEvidence(stats).find(w => !revisionTopics.has(w.topic));
  if (weak) {
    return { headline: `Practice ${weak.topic}`, why: `Rule 3 — recent accuracy ${weak.accuracy}% across ${weak.attempts} attempts is below the ${WEAK_RULE.accuracyBelow}% threshold.`, to: '/practice', accent: 'weak' };
  }
  if (state) {
    const level = getLevel(state.levelId);
    if (level && isLevelCompleted(stats, level)) {
      const nextLevel = levels.find(l => l.number === level.number + 1);
      const firstLesson = nextLevel ? publishedLessons(nextLevel)[0] : undefined;
      if (firstLesson) {
        return { headline: `Start ${firstLesson.title}`, why: `Rule 4 — Level ${level.number} is 100% complete; the next level is unlocked.`, to: `/learn/lesson/${firstLesson.id}`, accent: 'strong' };
      }
    }
    return { headline: `Start ${state.lessonTitle}`, why: 'Rule 5 — every journey starts with the first lesson; no prerequisites required.', to: `/learn/lesson/${state.lessonId}`, accent: 'strong' };
  }
  return { headline: 'Explore the curriculum', why: 'All published lessons are complete — browse upcoming content.', to: '/learn', accent: 'strong' };
}

/* ---------- curriculum journey (single aggregation source) ---------- */
export function getCurriculumProgress(stats: PlayerStats) {
  const rows = worlds.map(w => {
    const wl = levels.filter(l => l.worldId === w.id);
    return { world: w, completed: wl.filter(l => isLevelCompleted(stats, l)).length, total: wl.length, pct: getWorldProgress(stats, w.id) };
  });
  const next = getNextLesson(stats);
  return {
    rows,
    levelsCompleted: getCompletedLevelCount(stats),
    totalLevels: levels.length,
    overallPct: getOverallProgress(stats),
    overallCompletion: getOverallCompletion(stats),
    currentLevelId: next?.levelId ?? null,
    currentLevelNumber: next ? getLevel(next.levelId)?.number ?? 0 : getCompletedLevelCount(stats),
  };
}

/* ---------- projects + visualizations ---------- */
export function getProjectRows(stats: PlayerStats) {
  return projects.filter(p => p.status === 'PUBLISHED').map(p => {
    const level = levels.find(l => l.id === p.levelId);
    const skills = [...new Set((level?.lessons ?? []).flatMap(id => lessons[id]?.topics ?? []))].slice(0, 3);
    return { project: p, done: stats.completedProjects.includes(p.id), skills, levelNumber: level?.number ?? null };
  });
}

export function getVisualizationRows(stats: PlayerStats) {
  const lastUsed = new Map<string, string>();
  for (const e of stats.events ?? []) if (e.kind === 'visualization_completed' && e.id) lastUsed.set(e.id, e.at);
  return listVisualizations()
    .map(v => ({ viz: v, completed: stats.completedVisualizations.includes(v.id), lastIso: lastUsed.get(v.id) ?? null }))
    .sort((a, b) => (b.lastIso ?? '').localeCompare(a.lastIso ?? ''))
    .slice(0, 6);
}

/* ---------- practice helpers ---------- */
export function getSolvedSparkline(stats: PlayerStats): number[] {
  const out: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const k = todayKey(dt);
    out.push((stats.events ?? []).filter(e => e.kind === 'problem_solved' && e.at.slice(0, 10) === k).length);
  }
  return out;
}

export function getAccuracyMatrix(stats: PlayerStats): { topics: string[]; cells: Record<string, { attempted: number; solved: number }> } {
  const agg = new Map<string, { attempted: number; solved: number }>();
  for (const p of problems) {
    const r = stats.problems[p.id];
    if (!r) continue;
    for (const t of p.topics) {
      const key = `${t}||${p.difficulty}`;
      const cur = agg.get(key) ?? { attempted: 0, solved: 0 };
      cur.attempted += 1;
      if (r.solved) cur.solved += 1;
      agg.set(key, cur);
    }
  }
  const totals = new Map<string, number>();
  for (const [key, v] of agg) { const t = key.split('||')[0]; totals.set(t, (totals.get(t) ?? 0) + v.attempted); }
  const topics = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  const cells: Record<string, { attempted: number; solved: number }> = {};
  for (const [key, v] of agg) cells[key] = v;
  return { topics, cells };
}
