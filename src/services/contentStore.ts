import { achievementsData } from '../data/achievements';
import { levels, worlds } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { storageService } from './storageService';
import { can } from './authService';
import { sbEnabled, sbUpsert, sbSelect } from './supabaseRest';
import { Achievement, AppSettings, Level, Lesson, Problem, ThemeSettings, VisualizerMeta, World } from '../types';

const KEY = 'it_quest_content_v1';
let version = 0;
const listeners = new Set<() => void>();

export const defaultTheme: ThemeSettings = { primary: '#4f46e5', primaryHover: '#6366f1', success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#38bdf8', radiusMd: 8 };
export const defaultSettings: AppSettings = { dailyGoalMinutes: 20, xpLesson: 10, xpEasy: 20, xpMedium: 40, xpHard: 80, xpViz: 15 };
let theme: ThemeSettings = { ...defaultTheme };
let settings: AppSettings = { ...defaultSettings };
let vizMeta: Record<string, VisualizerMeta> = {};

interface Snapshot { worlds?: World[]; levels?: Level[]; lessons?: Record<string, Lesson>; problems?: Problem[]; achievements?: Achievement[]; theme?: ThemeSettings; settings?: AppSettings; vizMeta?: Record<string, VisualizerMeta> }

function sync<T>(target: T[], stored?: T[]) { if (!stored) return; target.length = 0; stored.forEach(x => target.push(x)); }

export function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty('--primary', theme.primary); r.setProperty('--primary-hover', theme.primaryHover);
  r.setProperty('--success', theme.success); r.setProperty('--warning', theme.warning);
  r.setProperty('--error', theme.error); r.setProperty('--info', theme.info);
  r.setProperty('--r-md', `${theme.radiusMd}px`);
}

function applySnapshot(snap: Snapshot) {
  sync(worlds, snap.worlds); sync(levels, snap.levels); sync(problems, snap.problems); sync(achievementsData, snap.achievements);
  if (snap.lessons) { for (const k of Object.keys(lessons)) if (!snap.lessons[k]) delete lessons[k]; for (const [k, v] of Object.entries(snap.lessons)) lessons[k] = v; }
  if (snap.theme) theme = { ...defaultTheme, ...snap.theme };
  if (snap.settings) settings = { ...defaultSettings, ...snap.settings };
  if (snap.vizMeta) vizMeta = snap.vizMeta;
  applyTheme();
}

export function initContentStore() {
  const local = storageService.get<Snapshot | null>(KEY, null);
  if (local) applySnapshot(local);
  if (sbEnabled()) sbSelect('content_snapshot', 'id=eq.main').then((rows: { data: Snapshot }[]) => { if (rows?.[0]?.data) applySnapshot(rows[0].data); }).catch(() => undefined);
}

export function persist() {
  const snap: Snapshot = { worlds, levels, lessons, problems, achievements: achievementsData, theme, settings, vizMeta };
  storageService.set(KEY, snap);
  if (sbEnabled()) sbUpsert('content_snapshot', [{ id: 'main', data: snap }]).catch(() => undefined);
  version++; listeners.forEach(l => l());
}

export const subscribeContent = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getContentVersion = () => version;
export const getTheme = () => theme;
export const getSettings = () => settings;
export const getVizMeta = () => vizMeta;
export const getVizXp = (id: string, fallback: number) => vizMeta[id]?.xpReward ?? fallback;

const guard = (action: string) => can(action);
const move = <T,>(arr: T[], i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };

export const admin = {
  createWorld(w: World) { if (!guard('structure.write')) return; worlds.push(w); persist(); },
  updateWorld(id: string, patch: Partial<World>) { if (!guard('structure.write')) return; const i = worlds.findIndex(w => w.id === id); if (i >= 0) worlds[i] = { ...worlds[i], ...patch }; persist(); },
  deleteWorld(id: string) { if (!guard('content.delete')) return; const i = worlds.findIndex(w => w.id === id); if (i >= 0) worlds.splice(i, 1); persist(); },
  createLevel(l: Level) { if (!guard('structure.write')) return; levels.push(l); persist(); },
  updateLevel(id: string, patch: Partial<Level>) { if (!guard('structure.write')) return; const i = levels.findIndex(l => l.id === id); if (i >= 0) levels[i] = { ...levels[i], ...patch }; persist(); },
  deleteLevel(id: string) { if (!guard('content.delete')) return; const i = levels.findIndex(l => l.id === id); if (i >= 0) levels.splice(i, 1); persist(); },
  moveLevel(id: string, dir: -1 | 1) { if (!guard('structure.write')) return; const i = levels.findIndex(l => l.id === id); const j = i + dir; if (j < 0 || j >= levels.length || levels[j].worldId !== levels[i].worldId) return; const a = levels[i], b = levels[j]; const tn = a.number; a.number = b.number; b.number = tn; move(levels, i, dir); persist(); },
  saveLesson(l: Lesson) { if (!guard('content.write')) return; lessons[l.id] = l; persist(); },
  deleteLesson(id: string) { if (!guard('content.delete')) return; delete lessons[id]; persist(); },
  saveProblem(p: Problem) { if (!guard('content.write')) return; const i = problems.findIndex(x => x.id === p.id); if (i >= 0) problems[i] = p; else problems.push(p); persist(); },
  deleteProblem(id: string) { if (!guard('content.delete')) return; const i = problems.findIndex(x => x.id === id); if (i >= 0) problems.splice(i, 1); persist(); },
  saveAchievement(a: Achievement) { if (!guard('content.write')) return; const i = achievementsData.findIndex(x => x.id === a.id); if (i >= 0) achievementsData[i] = a; else achievementsData.push(a); persist(); },
  deleteAchievement(id: string) { if (!guard('content.delete')) return; const i = achievementsData.findIndex(x => x.id === id); if (i >= 0) achievementsData.splice(i, 1); persist(); },
  setVizMeta(id: string, meta: VisualizerMeta) { if (!guard('content.write')) return; vizMeta[id] = meta; persist(); },
  saveTheme(t: ThemeSettings) { if (!guard('theme.write')) return; theme = { ...t }; applyTheme(); persist(); },
  saveSettings(s: AppSettings) { if (!guard('settings.write')) return; settings = { ...s }; persist(); },
};
