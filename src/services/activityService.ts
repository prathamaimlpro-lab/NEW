import { listVisualizations } from '../components/visualization/registry';
import { levels } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import { getLessonProgress, getNextLesson, getRevisionDue, isLessonUnlocked } from './progressService';
import { getTopicMastery } from './statsService';
import { todayKey } from './xpService';
import { Difficulty, PlayerStats } from '../types';

export interface HeatBreakdown { lessons: number; problems: number; other: number }
export interface HeatmapDay { date: string; value: number; breakdown: HeatBreakdown }

export function getHeatmapDays(stats: PlayerStats, weeks = 16): HeatmapDay[] {
  const out: HeatmapDay[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = todayKey(d);
    const a = stats.activity[k];
    const lessonsN = stats.lessonCompletedAt[k] ? 1 : 0;
    const problemsN = a?.problemsSolved ?? 0;
    const total = a?.count ?? 0;
    out.push({ date: k, value: total, breakdown: { lessons: lessonsN, problems: problemsN, other: Math.max(0, total - lessonsN - problemsN) } });
  }
  return out;
}

export interface TimelineEvent { at: string; date: string; time: string | null; kind: string; title: string; to?: string }

export function getTimeline(stats: PlayerStats, limit = 14): TimelineEvent[] {
  const vizTitles = new Map(listVisualizations().map(v => [v.id, v.title]));
  const ev: TimelineEvent[] = [];
  for (const e of stats.events ?? []) {
    const d = new Date(e.at);
    const title = e.title ?? (e.kind === 'visualization_completed' && e.id ? vizTitles.get(e.id) ?? e.id : e.id ?? '');
    ev.push({ at: e.at, date: todayKey(d), time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }), kind: e.kind, title, to: e.to });
  }
  const seen = new Set((stats.events ?? []).map(e => `${e.kind}:${e.title ?? e.id}`));
  for (const [id, date] of Object.entries(stats.lessonCompletedAt)) {
    const title = lessons[id]?.title ?? id;
    if (seen.has(`lesson_completed:${id}`) || seen.has(`lesson_completed:${title}`)) continue;
    ev.push({ at: date, date, time: null, kind: 'lesson_completed', title, to: `/learn/lesson/${id}` });
  }
  for (const [id, r] of Object.entries(stats.problems)) {
    if (!r.solved || !r.solvedDate) continue;
    const title = problems.find(p => p.id === id)?.title ?? id;
    if (seen.has(`problem_solved:${id}`)) continue;
    ev.push({ at: r.solvedDate, date: r.solvedDate, time: null, kind: 'problem_solved', title, to: `/practice/problems/${id}` });
  }
  ev.sort((a, b) => b.at.localeCompare(a.at));
  return ev.slice(0, limit);
}

export interface PracticeAnalytics {
  attemptedProblems: number; solvedProblems: number; submissions: number;
  successRate: number | null; avgAttempts: number | null; firstAttemptSolves: number;
  reviewCount: number; favouriteCount: number;
  byDifficulty: { d: Difficulty; attempted: number; solved: number; accuracy: number | null }[];
  byTopic: { topic: string; attempted: number; solved: number; accuracy: number; mastery: number | null }[];
}

function topicAggregation(stats: PlayerStats): Map<string, { attempted: number; solved: number }> {
  const agg = new Map<string, { attempted: number; solved: number }>();
  for (const p of problems) {
    const r = stats.problems[p.id];
    if (!r) continue;
    for (const t of p.topics) {
      const cur = agg.get(t) ?? { attempted: 0, solved: 0 };
      cur.attempted += 1;
      if (r.solved) cur.solved += 1;
      agg.set(t, cur);
    }
  }
  return agg;
}

export function getPracticeAnalytics(stats: PlayerStats): PracticeAnalytics {
  const recs = Object.entries(stats.problems);
  const attemptedProblems = recs.length;
  const solvedProblems = recs.filter(([, r]) => r.solved).length;
  const submissions = recs.reduce((s, [, r]) => s + r.attempts, 0);
  const masteryMap = new Map(getTopicMastery(stats).map(t => [t.topic, t]));
  const byDifficulty = (['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => {
    const ids = problems.filter(p => p.difficulty === d).map(p => p.id);
    const attempted = ids.filter(id => stats.problems[id]).length;
    const solved = ids.filter(id => stats.problems[id]?.solved).length;
    return { d, attempted, solved, accuracy: attempted > 0 ? Math.round((solved / attempted) * 100) : null };
  });
  const byTopic = [...topicAggregation(stats).entries()]
    .map(([topic, v]) => ({ topic, attempted: v.attempted, solved: v.solved, accuracy: Math.round((v.solved / v.attempted) * 100), mastery: masteryMap.get(topic)?.pct ?? null }))
    .sort((a, b) => b.attempted - a.attempted)
    .slice(0, 5);
  return {
    attemptedProblems, solvedProblems, submissions,
    successRate: submissions > 0 ? Math.round((solvedProblems / submissions) * 100) : null,
    avgAttempts: attemptedProblems > 0 ? submissions / attemptedProblems : null,
    firstAttemptSolves: recs.filter(([, r]) => r.solved && r.attempts === 1).length,
    reviewCount: recs.filter(([, r]) => r.review).length,
    favouriteCount: recs.filter(([, r]) => r.favourite).length,
    byDifficulty, byTopic,
  };
}

export interface ConceptInsight { topic: string; mastery: number | null; accuracy: number | null; reasons: string[]; recommended: { label: string; to: string } }

export function getWeakConcepts(stats: PlayerStats): ConceptInsight[] {
  const masteryMap = new Map(getTopicMastery(stats).map(t => [t.topic, t]));
  const revision = getRevisionDue(stats);
  const out: ConceptInsight[] = [];
  for (const [topic, agg] of topicAggregation(stats)) {
    const m = masteryMap.get(topic);
    const hasSample = (m && m.activity >= 3) || agg.attempted >= 3;
    if (!hasSample) continue;
    const reasons: string[] = [];
    const accuracy = agg.attempted >= 3 ? Math.round((agg.solved / agg.attempted) * 100) : null;
    if (m && m.activity >= 3 && m.pct < 60) reasons.push(`Mastery ${m.pct}% is below your working threshold`);
    if (accuracy !== null && accuracy < 60) reasons.push(`Practice accuracy ${accuracy}% across ${agg.attempted} problems`);
    const repeats = problems.filter(p => p.topics.includes(topic) && (stats.problems[p.id]?.attempts ?? 0) >= 2 && !stats.problems[p.id]?.solved).length;
    if (repeats >= 2) reasons.push(`${repeats} problems with repeated unsuccessful attempts`);
    if (revision.some(r => r.kind === 'lesson' && (lessons[r.id]?.topics ?? []).includes(topic))) reasons.push('Revision due on a related lesson');
    if (reasons.length === 0) continue;
    const lessonId = Object.values(lessons).find(l => l.status === 'PUBLISHED' && l.topics.includes(topic) && isLessonUnlocked(stats, l) && !stats.completedLessons.includes(l.id))?.id;
    out.push({ topic, mastery: m?.pct ?? null, accuracy, reasons, recommended: { label: lessonId ? `Review ${topic}` : `Practice ${topic}`, to: lessonId ? `/learn/lesson/${lessonId}` : '/practice' } });
  }
  return out.sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100)).slice(0, 3);
}

export function getStrongConcepts(stats: PlayerStats): ConceptInsight[] {
  const masteryMap = new Map(getTopicMastery(stats).map(t => [t.topic, t]));
  const out: ConceptInsight[] = [];
  for (const [topic, agg] of topicAggregation(stats)) {
    const m = masteryMap.get(topic);
    const accuracy = agg.attempted >= 3 ? Math.round((agg.solved / agg.attempted) * 100) : null;
    const reasons: string[] = [];
    if (m && m.activity >= 3 && m.pct >= 75) reasons.push(`Mastery ${m.pct}%`);
    if (accuracy !== null && accuracy >= 80) reasons.push(`Practice accuracy ${accuracy}% across ${agg.attempted} problems`);
    const hardSolved = problems.some(p => p.topics.includes(topic) && p.difficulty === 'HARD' && stats.problems[p.id]?.solved);
    if (hardSolved) reasons.push('Solved hard problems in this topic');
    if (reasons.length === 0) continue;
    out.push({ topic, mastery: m?.pct ?? null, accuracy, reasons, recommended: { label: `Stretch: harder ${topic} problems`, to: '/practice' } });
  }
  return out.sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0)).slice(0, 3);
}

export interface NextBestAction { label: string; reason: string; to: string; kind: string }

export function getNextBestAction(stats: PlayerStats): NextBestAction {
  const next = getNextLesson(stats);
  if (!next) return { label: 'Explore the curriculum', reason: 'All published lessons are complete — browse upcoming content.', to: '/learn', kind: 'curriculum' };
  if (stats.completedLessons.length === 0) return { label: `Start ${next.title}`, reason: 'Every engineering journey starts with the first lesson. No prerequisites required.', to: `/learn/lesson/${next.id}`, kind: 'start' };
  const prog = getLessonProgress(stats, next);
  if (prog > 0 && prog < 100) return { label: `Continue ${next.title}`, reason: `You are ${prog}% through this lesson — finishing now keeps momentum and unlocks the next level.`, to: `/learn/lesson/${next.id}`, kind: 'lesson' };
  const revision = getRevisionDue(stats)[0];
  if (revision) return { label: `Revision: ${revision.title}`, reason: 'Spaced repetition: this material is scheduled for review, and revising now protects earlier mastery.', to: revision.kind === 'lesson' ? `/learn/lesson/${revision.id}` : `/practice/problems/${revision.id}`, kind: 'revision' };
  const weak = getWeakConcepts(stats)[0];
  if (weak) return { label: weak.recommended.label, reason: `${weak.reasons[0]}. Targeted work here raises overall mastery fastest.`, to: weak.recommended.to, kind: 'weakness' };
  const project = projects.find(p => p.status === 'PUBLISHED' && !stats.completedProjects.includes(p.id) && (!p.levelId || p.levelId === next.levelId));
  if (project) return { label: `Project: ${project.title}`, reason: 'Applying what you learned consolidates mastery before the next level.', to: `/learn/level/${project.levelId ?? next.levelId}`, kind: 'project' };
  if ((stats.activity[todayKey()]?.count ?? 0) === 0) return { label: "Complete today's practice", reason: 'No learning activity recorded today — a short session keeps your streak and skills warm.', to: '/practice', kind: 'practice' };
  return { label: `Continue ${next.title}`, reason: 'Your curriculum position advances here next.', to: `/learn/lesson/${next.id}`, kind: 'curriculum' };
}
