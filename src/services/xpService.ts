import { DayActivity } from '../types';

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const TIER_NAMES = ['Explorer', 'Builder', 'Developer', 'Engineer', 'Architect', 'Specialist', 'Master', 'Legend', 'Sage'];

export function calculatePlayerLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) { if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1; else break; }
  return level;
}
export function getXpForNextLevel(xp: number): number {
  const level = calculatePlayerLevel(xp);
  return level >= LEVEL_THRESHOLDS.length ? 0 : LEVEL_THRESHOLDS[level] - xp;
}
export function getXpProgress(xp: number): number {
  const level = calculatePlayerLevel(xp);
  const cur = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level];
  if (next === undefined) return 100;
  return Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100));
}
export function getTierName(level: number): string { return TIER_NAMES[Math.min(level - 1, TIER_NAMES.length - 1)]; }
export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const hasActivity = (a: Record<string, DayActivity>, d: Date) => {
  const rec = a[todayKey(d)];
  return !!rec && (rec.minutes > 0 || rec.submissions > 0 || rec.problemsSolved > 0 || rec.xpEarned > 0);
};
export function computeStreak(activity: Record<string, DayActivity>): number {
  const d = new Date();
  if (!hasActivity(activity, d)) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (hasActivity(activity, d)) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
export function lastNDays(activity: Record<string, DayActivity>, n: number): ({ key: string; label: string } & DayActivity)[] {
  const out: ({ key: string; label: string } & DayActivity)[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const rec = activity[todayKey(d)] ?? { minutes: 0, problemsSolved: 0, submissions: 0, xpEarned: 0 };
    out.push({ key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), ...rec });
  }
  return out;
}
