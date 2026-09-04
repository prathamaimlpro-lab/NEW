export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const TIER_NAMES = ['Explorer', 'Builder', 'Developer', 'Engineer', 'Architect', 'Specialist', 'Master', 'Legend', 'Sage'];

export function calculatePlayerLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1; else break;
  }
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
export function getTierName(level: number): string {
  return TIER_NAMES[Math.min(level - 1, TIER_NAMES.length - 1)];
}
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function computeStreak(activity: Record<string, number>): number {
  const d = new Date();
  if (!activity[todayKey(d)]) d.setDate(d.getDate() - 1);
  let streak = 0;
  while ((activity[todayKey(d)] ?? 0) > 0) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
export function lastNDays(activity: Record<string, number>, n: number): { key: string; label: string; minutes: number }[] {
  const out: { key: string; label: string; minutes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({ key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), minutes: activity[todayKey(d)] ?? 0 });
  }
  return out;
}
