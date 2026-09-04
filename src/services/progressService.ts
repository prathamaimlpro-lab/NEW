import { courses, levels, lessons } from '../data/curriculum';
import { CurriculumLevel, Lesson, PlayerStats } from '../types';

export function getCourse(id: string) { return courses.find(c => c.id === id); }
export function getLevel(id: number) { return levels.find(l => l.id === id); }
export function levelLessons(level: CurriculumLevel): Lesson[] {
  return level.courses.flatMap(cid => (getCourse(cid)?.lessons ?? []).map(lid => lessons[lid]).filter(Boolean));
}
export function isLessonUnlocked(stats: PlayerStats, lesson: Lesson): boolean {
  const course = getCourse(lesson.courseId);
  if (!course) return false;
  const idx = course.lessons.indexOf(lesson.id);
  if (idx <= 0) return true;
  return stats.completedLessons.includes(course.lessons[idx - 1]);
}
export function isLevelUnlocked(stats: PlayerStats, levelId: number): boolean {
  if (levelId === 0) return true;
  const prev = getLevel(levelId - 1);
  if (!prev) return true;
  return levelLessons(prev).every(l => stats.completedLessons.includes(l.id));
}
export function getLessonProgress(stats: PlayerStats, lesson: Lesson): number {
  if (stats.completedLessons.includes(lesson.id)) return 100;
  const all = [...lesson.practice, ...lesson.masteryTest];
  const answered = all.filter(q => stats.practice[q.id]).length;
  const visited = stats.visitedLessons.includes(lesson.id) ? 25 : 0;
  if (all.length === 0) return visited;
  return Math.min(95, visited + Math.round((answered / all.length) * 70));
}
export function getLevelProgress(stats: PlayerStats, level: CurriculumLevel): number {
  const ls = levelLessons(level);
  if (ls.length === 0) return 0;
  return Math.round((ls.filter(l => stats.completedLessons.includes(l.id)).length / ls.length) * 100);
}
export function getOverallProgress(stats: PlayerStats): number {
  const all = Object.values(lessons).filter(l => l.status === 'PUBLISHED');
  if (all.length === 0) return 0;
  return Math.round((all.filter(l => stats.completedLessons.includes(l.id)).length / all.length) * 100);
}
export function getNextLesson(stats: PlayerStats): Lesson | null {
  for (const level of levels) {
    for (const l of levelLessons(level)) {
      if (l.status === 'PUBLISHED' && !stats.completedLessons.includes(l.id) && isLessonUnlocked(stats, l)) return l;
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
export function getTotalEstimatedHours(): number {
  return levels.reduce((sum, l) => sum + l.estimatedHours, 0);
}
