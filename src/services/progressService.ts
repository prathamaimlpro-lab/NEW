import { getLevel, getWorld, levels } from '../data/curriculum';
import { lessons } from '../data/lessons';
import type { Level, Lesson, PlayerStats } from '../types';

export { getLevel, getWorld };

export const levelLessons = (level: Level): Lesson[] => level.lessons.map(id => lessons[id]).filter(Boolean);
export const publishedLessons = (level: Level): Lesson[] => levelLessons(level).filter(l => l.status === 'PUBLISHED');

export function isLessonUnlocked(stats: PlayerStats, lesson: Lesson): boolean {
  return lesson.prerequisites.every(id => stats.completedLessons.includes(id));
}
export function isLevelCompleted(stats: PlayerStats, level: Level): boolean {
  const ls = publishedLessons(level);
  return ls.length > 0 && ls.every(l => stats.completedLessons.includes(l.id));
}
export function isLevelUnlocked(stats: PlayerStats, level: Level): boolean {
  return levels.filter(l => l.number < level.number && publishedLessons(l).length > 0).every(l => isLevelCompleted(stats, l));
}

export function getLessonProgress(stats: PlayerStats, lesson: Lesson): number {
  if (stats.completedLessons.includes(lesson.id)) return 100;
  const all = [...lesson.practice, ...lesson.masteryTest];
  const answered = all.filter(q => stats.practice[q.id]).length;
  const visited = stats.visitedLessons.includes(lesson.id) ? 25 : 0;
  if (all.length === 0) return visited;
  return Math.min(95, visited + Math.round((answered / all.length) * 70));
}

/* SINGLE SOURCE OF TRUTH: progress value and status label come from the same record. */
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export interface LessonProgressSummary { progress: number; status: LessonProgressStatus; label: string }
export function getLessonProgressSummary(stats: PlayerStats, lesson: Lesson): LessonProgressSummary {
  const progress = getLessonProgress(stats, lesson);
  const status: LessonProgressStatus = progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
  const label = status === 'COMPLETED' ? 'Completed' : status === 'IN_PROGRESS' ? 'In progress' : 'Not opened yet';
  return { progress, status, label };
}

export function getLevelProgress(stats: PlayerStats, level: Level): number {
  const ls = publishedLessons(level);
  if (ls.length === 0) return 0;
  return Math.round((ls.filter(l => stats.completedLessons.includes(l.id)).length / ls.length) * 100);
}

export type LevelState = 'done' | 'current' | 'available' | 'locked';
export function getLevelState(stats: PlayerStats, level: Level, currentLevelId: string | null): LevelState {
  if (isLevelCompleted(stats, level)) return 'done';
  if (!isLevelUnlocked(stats, level)) return 'locked';
  if (level.id === currentLevelId || getLevelProgress(stats, level) > 0) return 'current';
  return 'available';
}
export function getLessonState(stats: PlayerStats, lesson: Lesson): 'completed' | 'in-progress' | 'available' | 'locked' {
  if (stats.completedLessons.includes(lesson.id)) return 'completed';
  if (!isLessonUnlocked(stats, lesson)) return 'locked';
  return getLessonProgressSummary(stats, lesson).status === 'IN_PROGRESS' ? 'in-progress' : 'available';
}

export function getWorldProgress(stats: PlayerStats, worldId: string): number {
  const wl = levels.filter(l => l.worldId === worldId);
  if (wl.length === 0) return 0;
  return Math.round(wl.reduce((s, l) => s + getLevelProgress(stats, l), 0) / wl.length);
}
export function getOverallProgress(stats: PlayerStats): number {
  if (levels.length === 0) return 0;
  return Math.round(levels.reduce((s, l) => s + getLevelProgress(stats, l), 0) / levels.length);
}
export function getCompletedLevelCount(stats: PlayerStats): number {
  return levels.filter(l => isLevelCompleted(stats, l)).length;
}
export function getOverallCompletion(stats: PlayerStats): number {
  return levels.length ? Math.round((getCompletedLevelCount(stats) / levels.length) * 100) : 0;
}

export function getNextLesson(stats: PlayerStats): Lesson | null {
  for (const level of [...levels].sort((a, b) => a.number - b.number)) {
    for (const l of publishedLessons(level)) {
      if (!stats.completedLessons.includes(l.id) && isLessonUnlocked(stats, l)) return l;
    }
  }
  return null;
}
export function getCurrentLevelId(stats: PlayerStats): string | null {
  return getNextLesson(stats)?.levelId ?? null;
}

export interface RevisionItem { kind: 'lesson' | 'problem'; id: string; title: string; days: number }
function problemTitle(id: string): string {
  const q = Object.values(lessons).flatMap(l => [...l.practice, ...l.masteryTest]).find(x => x.id === id);
  return q?.question ?? id;
}
export function getRevisionDue(stats: PlayerStats): RevisionItem[] {
  const out: RevisionItem[] = [];
  for (const [id, date] of Object.entries(stats.lessonCompletedAt)) {
    const days = Math.floor((Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000);
    if (days >= 7) out.push({ kind: 'lesson', id, title: lessons[id]?.title ?? id, days });
  }
  for (const [id, rec] of Object.entries(stats.problems)) {
    if (rec.review && rec.solved) out.push({ kind: 'problem', id, title: problemTitle(id), days: 0 });
  }
  return out;
}
