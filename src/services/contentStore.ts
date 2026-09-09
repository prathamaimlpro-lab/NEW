import { achievementsData } from '../data/achievements';
import { levels, worlds } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { projects } from '../data/projects';
import { storageService } from './storageService';
import { can, getRole } from './authService';
import { sbEnabled, sbUpsert, sbSelect } from './supabaseRest';
import { validateLevel, validateLesson, validateProblem, validateProject, validateSnapshot, validateWorld } from './validationService';
import { listVisualizations } from '../components/visualization/registry';
import { Achievement, AppSettings, Level, Lesson, Problem, Project, ThemeSettings, VisualizerMeta, World } from '../types';

const KEY = 'it_quest_content_v1';
let version = 0;
const listeners = new Set<() => void>();

export const defaultTheme: ThemeSettings = { primary: '#7bd0ff', primaryHover: '#a5dfff', success: '#4edea3', warning: '#f2a35c', error: '#ef6b6b', info: '#7bd0ff', radiusMd: 14 };
export const defaultSettings: AppSettings = { dailyGoalMinutes: 20, xpLesson: 10, xpEasy: 20, xpMedium: 40, xpHard: 80, xpViz: 15 };
let theme: ThemeSettings = { ...defaultTheme };
let settings: AppSettings = { ...defaultSettings };
let vizMeta: Record<string, VisualizerMeta> = {};

interface Snapshot { worlds?: World[]; levels?: Level[]; lessons?: Record<string, Lesson>; problems?: Problem[]; projects?: Project[]; achievements?: Achievement[]; theme?: ThemeSettings; settings?: AppSettings; vizMeta?: Record<string, VisualizerMeta> }

function sync<T>(target: T[], stored?: T[]) { if (!stored) return; target.length = 0; stored.forEach(x => target.push(x)); }

export function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty('--primary', theme.primary); r.setProperty('--primary-hover', theme.primaryHover);
  r.setProperty('--success', theme.success); r.setProperty('--warning', theme.warning);
  r.setProperty('--error', theme.error); r.setProperty('--info', theme.info);
  r.setProperty('--r-md', `${theme.radiusMd}px`);
}

function applySnapshot(snap: Snapshot) {
  sync(worlds, snap.worlds); sync(levels, snap.levels); sync(problems, snap.problems); sync(projects, snap.projects); sync(achievementsData, snap.achievements);
  if (snap.lessons) { for (const k of Object.keys(lessons)) if (!snap.lessons[k]) delete lessons[k]; for (const [k, v] of Object.entries(snap.lessons)) lessons[k] = v; }
  if (snap.theme) theme = { ...defaultTheme, ...snap.theme };
  if (snap.settings) settings = { ...defaultSettings, ...snap.settings };
  if (snap.vizMeta) vizMeta = snap.vizMeta;
  applyTheme();
}

function mergeSnapshot(snap: Snapshot) {
  (snap.worlds ?? []).forEach(w => { const i = worlds.findIndex(x => x.id === w.id); if (i >= 0) worlds[i] = w; else worlds.push(w); });
  (snap.levels ?? []).forEach(l => { const i = levels.findIndex(x => x.id === l.id); if (i >= 0) levels[i] = l; else levels.push(l); });
  (snap.problems ?? []).forEach(p => { const i = problems.findIndex(x => x.id === p.id); if (i >= 0) problems[i] = p; else problems.push(p); });
  (snap.projects ?? []).forEach(p => { const i = projects.findIndex(x => x.id === p.id); if (i >= 0) projects[i] = p; else projects.push(p); });
  (snap.achievements ?? []).forEach(a => { const i = achievementsData.findIndex(x => x.id === a.id); if (i >= 0) achievementsData[i] = a; else achievementsData.push(a); });
  for (const [k, v] of Object.entries(snap.lessons ?? {})) lessons[k] = v;
  if (snap.theme) theme = { ...defaultTheme, ...snap.theme };
  if (snap.settings) settings = { ...defaultSettings, ...snap.settings };
  if (snap.vizMeta) vizMeta = { ...vizMeta, ...snap.vizMeta };
  applyTheme();
}

const snapshotOf = (): Snapshot => ({ worlds, levels, lessons, problems, projects, achievements: achievementsData, theme, settings, vizMeta });
const publishedOf = (snap: Snapshot): Snapshot => ({
  ...snap,
  levels: (snap.levels ?? []).filter(l => l.status === 'PUBLISHED'),
  lessons: Object.fromEntries(Object.entries(snap.lessons ?? {}).filter(([, l]) => l.status === 'PUBLISHED')),
  problems: (snap.problems ?? []).filter(p => p.status === 'PUBLISHED'),
  projects: (snap.projects ?? []).filter(p => p.status === 'PUBLISHED'),
});

export function initContentStore() {
  const local = storageService.get<Snapshot | null>(KEY, null);
  if (local) applySnapshot(local);
}

export async function syncContentFromServer(): Promise<void> {
  if (!sbEnabled()) return;
  const role = getRole();
  const id = role && role !== 'student' ? 'main' : 'published';
  try {
    const rows = await sbSelect<{ data: Snapshot }>('content_snapshot', `id=eq.${id}`);
    if (rows?.[0]?.data) { applySnapshot(rows[0].data); persistLocal(); }
  } catch { /* offline or not authorized: keep local cache */ }
}

function persistLocal() {
  storageService.set(KEY, snapshotOf());
  version++; listeners.forEach(l => l());
}

export function persist() {
  persistLocal();
  if (sbEnabled() && can('content.write')) {
    const full = snapshotOf();
    sbUpsert('content_snapshot', [{ id: 'main', data: full }, { id: 'published', data: publishedOf(full) }]).catch(() => undefined);
  }
}

export const subscribeContent = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getContentVersion = () => version;
export const getTheme = () => theme;
export const getSettings = () => settings;
export const getVizMeta = () => vizMeta;
export const getVizXp = (id: string, fallback: number) => vizMeta[id]?.xpReward ?? fallback;

export function exportContent(): string { return JSON.stringify(snapshotOf(), null, 2); }

export function importContent(json: string): string | null {
  let snap: Snapshot;
  try { snap = JSON.parse(json); } catch (e) { return `Invalid JSON: ${(e as Error).message}`; }
  const err = validateSnapshot(snap);
  if (err) return err;
  mergeSnapshot(snap);
  persist();
  return null;
}

const guard = (action: string) => can(action);
const swap = <T,>(arr: T[], i: number, j: number) => { [arr[i], arr[j]] = [arr[j], arr[i]]; };
const vizIds = () => listVisualizations().map(v => v.id);
const lessonIds = () => Object.keys(lessons);

export const admin = {
  createWorld(w: World): string | null { if (!guard('structure.write')) return 'Permission denied'; const e = validateWorld(w, worlds); if (e) return e; worlds.push(w); persist(); return null; },
  updateWorld(id: string, patch: Partial<World>): string | null { if (!guard('structure.write')) return 'Permission denied'; const i = worlds.findIndex(w => w.id === id); if (i < 0) return 'World not found'; const next = { ...worlds[i], ...patch }; const e = validateWorld(next, worlds); if (e) return e; worlds[i] = next; persist(); return null; },
  deleteWorld(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; if (levels.some(l => l.worldId === id)) return 'Cannot delete a world that still contains levels'; const i = worlds.findIndex(w => w.id === id); if (i >= 0) worlds.splice(i, 1); persist(); return null; },
  createLevel(l: Level): string | null { if (!guard('structure.write')) return 'Permission denied'; const e = validateLevel(l, worlds); if (e) return e; levels.push(l); persist(); return null; },
  updateLevel(id: string, patch: Partial<Level>): string | null { if (!guard('structure.write')) return 'Permission denied'; const i = levels.findIndex(l => l.id === id); if (i < 0) return 'Level not found'; const next = { ...levels[i], ...patch }; const e = validateLevel(next, worlds); if (e) return e; levels[i] = next; persist(); return null; },
  deleteLevel(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; if (levels.some(l => l.prerequisites.includes(id))) return 'Another level depends on this level'; const i = levels.findIndex(l => l.id === id); if (i >= 0) levels.splice(i, 1); persist(); return null; },
  moveLevel(id: string, dir: -1 | 1): string | null { if (!guard('structure.write')) return 'Permission denied'; const i = levels.findIndex(l => l.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= levels.length || levels[j].worldId !== levels[i].worldId) return null; const tn = levels[i].number; levels[i].number = levels[j].number; levels[j].number = tn; swap(levels, i, j); persist(); return null; },
  moveLesson(levelId: string, lessonId: string, dir: -1 | 1): string | null { if (!guard('structure.write')) return 'Permission denied'; const lv = levels.find(l => l.id === levelId); if (!lv) return 'Level not found'; const i = lv.lessons.indexOf(lessonId); const j = i + dir; if (i < 0 || j < 0 || j >= lv.lessons.length) return null; swap(lv.lessons, i, j); persist(); return null; },
  saveLesson(l: Lesson): string | null { if (!guard('content.write')) return 'Permission denied'; const e = validateLesson(l, levels, vizIds(), lessonIds()); if (e) return e; lessons[l.id] = l; persist(); return null; },
  deleteLesson(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; const lv = levels.find(l => l.lessons.includes(id)); if (lv) lv.lessons = lv.lessons.filter(x => x !== id); delete lessons[id]; persist(); return null; },
  saveProblem(p: Problem): string | null { if (!guard('content.write')) return 'Permission denied'; const e = validateProblem(p, levels, lessonIds()); if (e) return e; const i = problems.findIndex(x => x.id === p.id); if (i >= 0) problems[i] = p; else problems.push(p); persist(); return null; },
  deleteProblem(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; const i = problems.findIndex(x => x.id === id); if (i >= 0) problems.splice(i, 1); persist(); return null; },
  saveProject(p: Project): string | null { if (!guard('content.write')) return 'Permission denied'; const e = validateProject(p, levels); if (e) return e; const i = projects.findIndex(x => x.id === p.id); if (i >= 0) projects[i] = p; else projects.push(p); persist(); return null; },
  deleteProject(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; const i = projects.findIndex(x => x.id === id); if (i >= 0) projects.splice(i, 1); persist(); return null; },
  saveAchievement(a: Achievement): string | null { if (!guard('content.write')) return 'Permission denied'; if (!a.title.trim()) return 'Achievement title is required'; if (a.xp < 0) return 'XP must be 0 or more'; const i = achievementsData.findIndex(x => x.id === a.id); if (i >= 0) achievementsData[i] = a; else achievementsData.push(a); persist(); return null; },
  deleteAchievement(id: string): string | null { if (!guard('content.delete')) return 'Permission denied'; const i = achievementsData.findIndex(x => x.id === id); if (i >= 0) achievementsData.splice(i, 1); persist(); return null; },
  setVizMeta(id: string, meta: VisualizerMeta): string | null { if (!guard('content.write')) return 'Permission denied'; if (meta.xpReward < 0) return 'XP must be 0 or more'; vizMeta[id] = meta; persist(); return null; },
  saveTheme(t: ThemeSettings): string | null { if (!guard('theme.write')) return 'Permission denied'; theme = { ...t }; applyTheme(); persist(); return null; },
  saveSettings(s: AppSettings): string | null { if (!guard('settings.write')) return 'Permission denied'; if (Object.values(s).some(v => v < 0)) return 'Settings values must be 0 or more'; settings = { ...s }; persist(); return null; },
};
