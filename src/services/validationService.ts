import { Level, Lesson, Problem, Project, World } from '../types';

const req = (v: string | undefined, label: string): string | null => (!v || !v.trim() ? `${label} is required` : null);

export function validateWorld(w: World, worlds: World[]): string | null {
  if (req(w.title, 'World title')) return req(w.title, 'World title');
  if (w.levelRange[0] > w.levelRange[1]) return 'World level range is invalid';
  if (worlds.some(x => x.id !== w.id && x.number === w.number)) return `Another world already uses number ${w.number}`;
  return null;
}

export function validateLevel(l: Level, worlds: World[]): string | null {
  if (req(l.title, 'Level title')) return req(l.title, 'Level title');
  if (!worlds.some(w => w.id === l.worldId)) return 'Level references a world that does not exist';
  if (l.estimatedHours < 0) return 'Estimated hours must be 0 or more';
  if (l.xpReward < 0) return 'XP reward must be 0 or more';
  return null;
}

export function validateLesson(l: Lesson, levels: Level[], vizIds: string[], lessonIds: string[]): string | null {
  if (req(l.title, 'Lesson title')) return req(l.title, 'Lesson title');
  if (!levels.some(x => x.id === l.levelId)) return 'Lesson references a level that does not exist';
  if (l.estimatedMinutes <= 0) return 'Estimated minutes must be greater than 0';
  if (l.xpReward < 0) return 'XP reward must be 0 or more';
  if (l.visualizationId && !vizIds.includes(l.visualizationId)) return `Visualization "${l.visualizationId}" is not registered`;
  if (l.prerequisites.some(p => p !== l.id && !lessonIds.includes(p))) return 'Lesson references a prerequisite lesson that does not exist';
  return null;
}

export function validateProblem(p: Problem, levels: Level[], lessonIds: string[]): string | null {
  if (req(p.title, 'Problem title')) return req(p.title, 'Problem title');
  if (req(p.description, 'Problem description')) return req(p.description, 'Problem description');
  if (!levels.some(l => l.id === p.relatedLevel)) return 'Problem references a level that does not exist';
  if (p.relatedLessons.some(id => !lessonIds.includes(id))) return 'Problem references a lesson that does not exist';
  if (p.options.length < 2) return 'Problem needs at least 2 options';
  if (!p.options.includes(p.correctAnswer)) return 'Correct answer must be one of the options';
  if (p.xp < 0) return 'XP must be 0 or more';
  return null;
}

export function validateProject(pr: Project, levels: Level[]): string | null {
  if (req(pr.title, 'Project title')) return req(pr.title, 'Project title');
  if (pr.levelId && !levels.some(l => l.id === pr.levelId)) return 'Project references a level that does not exist';
  if (pr.xp < 0) return 'XP must be 0 or more';
  return null;
}

export function validateSnapshot(s: unknown): string | null {
  if (typeof s !== 'object' || s === null) return 'Content file must be a JSON object';
  const snap = s as Record<string, unknown>;
  for (const key of ['worlds', 'levels', 'lessons', 'problems', 'projects', 'achievements']) {
    if (snap[key] !== undefined && !Array.isArray(snap[key]) && key !== 'lessons') return `"${key}" must be an array`;
    if (key === 'lessons' && snap[key] !== undefined && (typeof snap[key] !== 'object' || Array.isArray(snap[key]))) return 'lessons must be an object map';
  }
  const worlds = (snap.worlds ?? []) as World[];
  const levels = (snap.levels ?? []) as Level[];
  const lessons = Object.values((snap.lessons ?? {}) as Record<string, Lesson>);
  const lessonIds = lessons.map(l => l.id);
  const vizOk = true; // registry check happens on save; import keeps ids as-is
  const ids = [...worlds.map(w => w.id), ...levels.map(l => l.id), ...lessonIds, ...((snap.problems ?? []) as Problem[]).map(p => p.id), ...((snap.projects ?? []) as Project[]).map(p => p.id)];
  if (new Set(ids).size !== ids.length) return 'Duplicate content IDs found in file';
  for (const l of levels) { const e = validateLevel(l, worlds); if (e) return e; }
  for (const l of lessons) { const e = validateLesson(l, levels, [], lessonIds); if (e && !vizOk) return e; if (e && !e.startsWith('Visualization')) return e; }
  for (const p of (snap.problems ?? []) as Problem[]) { const e = validateProblem(p, levels, lessonIds); if (e) return e; }
  for (const pr of (snap.projects ?? []) as Project[]) { const e = validateProject(pr, levels); if (e) return e; }
  return null;
}
