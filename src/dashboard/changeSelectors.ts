import { levels as legacyLevels, worlds as legacyWorlds } from '../data/curriculum';
import { publishedLessons } from '../services/progressService';
import { todayKey } from '../services/xpService';
import type { PlayerStats } from '../types';

export interface Insight {
  id: string; kind: 'lesson' | 'practice' | 'revision' | 'project' | 'visual' | 'level' | 'world' | 'velocity' | 'accuracy';
  title: string; evidence: string; when: string; delta?: string; action?: { label: string; to: string };
}

const rel = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
export const formatWhen = (iso: string) => `${rel(iso)} · ${new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

function weekLessons(stats: PlayerStats, offset: number): number {
  const start = new Date(); start.setDate(start.getDate() - offset * 7 - 6);
  let c = 0;
  for (let d = 0; d < 7; d++) { const dt = new Date(start); dt.setDate(dt.getDate() + d); if (stats.lessonCompletedAt[dt.toISOString().slice(0, 10)]) c++; }
  return c;
}
function weekAccuracy(stats: PlayerStats, offset: number): { acc: number | null } {
  const start = new Date(); start.setDate(start.getDate() - offset * 7 - 6);
  let sub = 0, sol = 0;
  for (let d = 0; d < 7; d++) { const dt = new Date(start); dt.setDate(dt.getDate() + d); const a = stats.activity[todayKey(dt)]; sub += a?.submissions ?? 0; sol += a?.problemsSolved ?? 0; }
  return { acc: sub > 0 ? Math.round((sol / sub) * 100) : null };
}
const levelDone = (stats: PlayerStats, lvl: (typeof legacyLevels)[number]) => {
  const ls = publishedLessons(lvl);
  return ls.length > 0 && ls.every(l => stats.completedLessons.includes(l.id));
};
const levelWhen = (stats: PlayerStats, lvl: (typeof legacyLevels)[number]) => {
  const dates = publishedLessons(lvl).map(l => stats.lessonCompletedAt[l.id]).filter(Boolean).sort();
  return dates.length ? `${dates[dates.length - 1]}T00:00:00.000Z` : null;
};

export function selectWhatChangedInsights(stats: PlayerStats): Insight[] {
  const out: Insight[] = [];
  const seen = new Set<string>();
  const push = (i: Insight) => { if (!seen.has(i.id)) { seen.add(i.id); out.push(i); } };

  for (const e of (stats.events ?? [])) {
    if (e.kind === 'lesson_completed') push({ id: `lc-${e.id}-${e.at}`, kind: 'lesson', title: `Lesson completed: ${e.title ?? e.id}`, evidence: 'lesson completion recorded', when: e.at, action: { label: 'Revisit', to: e.to ?? `/learn/lesson/${e.id}` } });
    else if (e.kind === 'problem_solved') push({ id: `ps-${e.id}-${e.at}`, kind: 'practice', title: `Problem solved: ${e.title ?? e.id}`, evidence: 'first-solve recorded', when: e.at, action: { label: 'Practice more', to: '/practice' } });
    else if (e.kind === 'revision_completed') push({ id: `rc-${e.id}-${e.at}`, kind: 'revision', title: `Revision completed: ${e.title ?? e.id}`, evidence: 'spaced revision logged', when: e.at, action: { label: 'Review', to: e.to ?? '/practice' } });
    else if (e.kind === 'project_completed') push({ id: `pc-${e.id}-${e.at}`, kind: 'project', title: `Project completed: ${e.title ?? e.id}`, evidence: 'project milestone recorded', when: e.at, action: { label: 'Open projects', to: '/learn' } });
    else if (e.kind === 'visualization_completed') push({ id: `vc-${e.id}-${e.at}`, kind: 'visual', title: `Visualization completed: ${e.title ?? e.id}`, evidence: 'visualization finished', when: e.at, action: { label: 'Explore', to: `/explore/viz/${e.id}` } });
  }

  for (const lvl of legacyLevels) {
    if (!levelDone(stats, lvl)) continue;
    const when = levelWhen(stats, lvl);
    if (!when) continue;
    push({ id: `level-${lvl.id}`, kind: 'level', title: `Level ${lvl.number} completed`, evidence: `${publishedLessons(lvl).length} lessons`, when, action: { label: 'Next level', to: `/learn/level/${lvl.id}` } });
  }
  for (const w of legacyWorlds) {
    const wl = legacyLevels.filter(l => l.worldId === w.id);
    const withLessons = wl.filter(l => publishedLessons(l).length > 0);
    if (withLessons.length === 0 || !withLessons.every(l => levelDone(stats, l))) continue;
    const whens = withLessons.map(l => levelWhen(stats, l)).filter(Boolean) as string[];
    if (whens.length === 0) continue;
    push({ id: `world-${w.id}`, kind: 'world', title: `World ${w.number} completed`, evidence: `${withLessons.length} levels`, when: whens.sort().pop()!, action: { label: 'Curriculum', to: '/learn' } });
  }

  const lt = weekLessons(stats, 0), lp = weekLessons(stats, 1);
  if ((lt > 0 || lp > 0) && lt !== lp) {
    push({ id: 'velocity-week', kind: 'velocity', title: 'Learning velocity changed', evidence: `${lt} lessons this week vs ${lp} last week`, when: new Date().toISOString(), delta: `${lt - lp >= 0 ? '+' : ''}${lt - lp} lessons`, action: { label: 'Continue', to: '/learn' } });
  }
  const at = weekAccuracy(stats, 0), ap = weekAccuracy(stats, 1);
  if (at.acc !== null && ap.acc !== null && at.acc !== ap.acc) {
    push({ id: 'accuracy-week', kind: 'accuracy', title: 'Practice accuracy changed', evidence: `${at.acc}% this week vs ${ap.acc}% last week`, when: new Date().toISOString(), delta: `${at.acc - ap.acc >= 0 ? '+' : ''}${at.acc - ap.acc} pts`, action: { label: 'Practice', to: '/practice' } });
  }

  return out.sort((a, b) => b.when.localeCompare(a.when)).slice(0, 8);
}
