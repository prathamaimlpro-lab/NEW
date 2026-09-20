import { lessons as legacyLessons } from '../data/lessons';
import { getRevisionPlan } from '../services/conceptMastery';
import { getStrengthEvidence, getWeaknessEvidence } from '../services/dashboardService';
import { getLesson, getRevisionDue } from '../services/progressService';
import type { PlayerStats } from '../types';
import { CONTRACTS } from './contracts';
import type { ZoneResult } from './types';

export interface IntelligenceItem {
  id: string; kind: 'topic';
  title: string; attempts: number; accuracy: number | null; mastery: number | null; lastDays: number | null;
  why: string; actions: { label: string; to: string }[];
}

const lessonForTopic = (topic: string) => Object.values(legacyLessons).find(l => (l.topics ?? []).includes(topic));

export function selectWeaknessItems(stats: PlayerStats): ZoneResult<IntelligenceItem[]> {
  const all = getWeaknessEvidence(stats);
  const qualified = all.filter(w => w.attempts >= CONTRACTS.weakness.minAttemptsPerTopic);
  if (qualified.length === 0) {
    if (all.length) {
      return { status: 'insufficient', data: null, sampleSize: Math.max(...all.map(w => w.attempts)), threshold: CONTRACTS.weakness.minAttemptsPerTopic, reason: `Topics need ≥${CONTRACTS.weakness.minAttemptsPerTopic} attempts before weakness is reliable.` };
    }
    return { status: 'empty', data: null, sampleSize: 0, threshold: CONTRACTS.weakness.minAttemptsPerTopic };
  }
  const items: IntelligenceItem[] = qualified.map(w => {
    const lesson = lessonForTopic(w.topic);
    const actions = [{ label: 'Practice', to: '/practice' }];
    if (lesson) actions.push({ label: 'Open lesson', to: `/learn/lesson/${lesson.id}` });
    return {
      id: w.topic, kind: 'topic', title: w.topic, attempts: w.attempts, accuracy: w.accuracy, mastery: w.mastery, lastDays: w.lastDays,
      why: `Accuracy ${w.accuracy}% is below the 60% threshold across ${w.attempts} attempts.`,
      actions,
    };
  });
  return { status: 'ready', data: items, sampleSize: items.reduce((s, i) => s + i.attempts, 0), threshold: CONTRACTS.weakness.minAttemptsPerTopic };
}

export function selectStrengthItems(stats: PlayerStats): ZoneResult<IntelligenceItem[]> {
  const all = getStrengthEvidence(stats);
  const qualified = all.filter(w => w.attempts >= CONTRACTS.strength.minAttemptsPerTopic);
  if (qualified.length === 0) {
    if (all.length) {
      return { status: 'insufficient', data: null, sampleSize: Math.max(...all.map(w => w.attempts)), threshold: CONTRACTS.strength.minAttemptsPerTopic, reason: `Topics need ≥${CONTRACTS.strength.minAttemptsPerTopic} attempts before strength is reliable.` };
    }
    return { status: 'empty', data: null, sampleSize: 0, threshold: CONTRACTS.strength.minAttemptsPerTopic };
  }
  const items: IntelligenceItem[] = qualified.map(w => ({
    id: w.topic, kind: 'topic', title: w.topic, attempts: w.attempts, accuracy: w.accuracy, mastery: w.mastery, lastDays: w.lastDays,
    why: `Accuracy ${w.accuracy}% at or above 80% across ${w.attempts} attempts, mastery ${w.mastery}%.`,
    actions: [{ label: 'Practice', to: '/practice' }],
  }));
  return { status: 'ready', data: items, sampleSize: items.reduce((s, i) => s + i.attempts, 0), threshold: CONTRACTS.strength.minAttemptsPerTopic };
}

export interface RevisionItem {
  id: string; title: string; kind: 'lesson' | 'problem' | 'concept';
  statusLabel: 'due' | 'approaching' | 'completed-cycle';
  daysSince: number;
  retentionRisk: 'low' | 'moderate' | 'high' | null;
  actions: { label: string; to: string }[];
}

const INTERVAL = 7;

export function selectRevisionItems(stats: PlayerStats): ZoneResult<RevisionItem[]> {
  const due = getRevisionDue(stats);
  const plan = getRevisionPlan(stats);

  const cycles: { id: string; title: string; daysSinceActivity: number }[] = [];
  for (const [id, date] of Object.entries(stats.lessonCompletedAt)) {
    const dueAt = new Date(`${date}T00:00:00`).getTime() + INTERVAL * 86400000;
    let lastAfter = -1;
    for (const k of Object.keys(stats.activity)) {
      if ((stats.activity[k]?.count ?? 0) > 0) {
        const t = new Date(`${k}T00:00:00`).getTime();
        if (t >= dueAt && t > lastAfter) lastAfter = t;
      }
    }
    if (lastAfter >= 0) cycles.push({ id, title: getLesson(id)?.title ?? id, daysSinceActivity: Math.floor((Date.now() - lastAfter) / 86400000) });
  }

  const items: RevisionItem[] = [];
  for (const d of due) {
    items.push({
      id: `${d.kind}-${d.id}`, title: d.title, kind: d.kind, statusLabel: 'due', daysSince: d.days, retentionRisk: null,
      actions: d.kind === 'lesson' ? [{ label: 'Review', to: `/learn/lesson/${d.id}` }] : [{ label: 'Review', to: `/practice/problems/${d.id}` }],
    });
  }
  for (const p of plan) {
    items.push({ id: `concept-${p.concept.id}`, title: p.concept.title, kind: 'concept', statusLabel: 'approaching', daysSince: 0, retentionRisk: null, actions: [{ label: 'Practice', to: '/practice' }] });
  }
  for (const c of cycles) {
    const risk = c.daysSinceActivity > 2 * INTERVAL ? 'high' : c.daysSinceActivity > INTERVAL ? 'moderate' : 'low';
    items.push({ id: `cycle-${c.id}`, title: c.title, kind: 'lesson', statusLabel: 'completed-cycle', daysSince: c.daysSinceActivity, retentionRisk: risk, actions: [{ label: 'Review', to: `/learn/lesson/${c.id}` }] });
  }

  if (items.length === 0) return { status: 'empty', data: null, sampleSize: 0, threshold: CONTRACTS.revisionRisk.minCompletedCycles };
  return { status: 'ready', data: items, sampleSize: items.length, threshold: CONTRACTS.revisionRisk.minCompletedCycles };
}
