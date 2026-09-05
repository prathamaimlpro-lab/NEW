import { getLevel, getWorld, levels, lessons } from '../data/curriculum';
import { Level, Lesson, PlayerStats, World } from '../types';

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
export function getLevelProgress(stats: PlayerStats, level: Level): number {
  const ls = publishedLessons(level);
  if (ls.length === 0) return 0;
  return Math.round((ls.filter(l => stats.completedLessons.includes(l.id)).length / ls.length) * 100);
}
export function getWorldProgress(stats: PlayerStats, world: World): number {
  const ls = levels.filter(l => l.worldId === world.id).flatMap(publishedLessons);
  if (ls.length === 0) return 0;
  return Math.round((ls.filter(l => stats.completedLessons.includes(l.id)).length / ls.length) * 100);
}
export function getOverallProgress(stats: PlayerStats): number {
  const all = Object.values(lessons).filter(l => l.status === 'PUBLISHED');
  if (all.length === 0) return 0;
  return Math.round((all.filter(l => stats.completedLessons.includes(l.id)).length / all.length) * 100);
}
export function getNextLesson(stats: PlayerStats): Lesson | null {
  for (const level of [...levels].sort((a, b) => a.number - b.number)) {
    for (const l of publishedLessons(level)) {
      if (!stats.completedLessons.includes(l.id) && isLessonUnlocked(stats, l)) return l;
    }
  }
  return null;
}
export type LessonState = 'completed' | 'in-progress' | 'available' | 'locked';
export function getLessonState(stats: PlayerStats, lesson: Lesson): LessonState {
  if (stats.completedLessons.includes(lesson.id)) return 'completed';
  if (!isLessonUnlocked(stats, lesson)) return 'locked';
  if (getLessonProgress(stats, lesson) > 0) return 'in-progress';
  return 'available';
}
export function getTotalEstimatedHours(): number { return levels.reduce((s, l) => s + l.estimatedHours, 0); }
export function getCompletedLevelCount(stats: PlayerStats): number { return levels.filter(l => isLevelCompleted(stats, l)).length; }
