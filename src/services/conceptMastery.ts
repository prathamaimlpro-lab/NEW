import type { Concept } from '../content/types';
import type { PlayerStats } from '../types';
import { lessons as legacyLessons } from '../data/lessons';
import { getMasteryCriteria, getProjects, getRevisions, listAll } from './contentService';
import { getPracticeBank, resolveQuestionMeta } from './practiceService';
import { getTopicMastery } from './statsService';

export type MasteryTier = 'NOT_STARTED' | 'EXPOSED' | 'PRACTICING' | 'PROFICIENT' | 'MASTERED';

export interface ConceptEvidence {
  conceptId: string;
  lessonCompleted: boolean;
  practiceAttempts: number;
  practiceCorrect: number;
  accuracy: number | null;
  projectCompleted: boolean;
  confidence: number | null;
  revisionDue: boolean;
  masteryPct: number;
  tier: MasteryTier;
}

const strip = (t: string) => t.replace('topic:', '');
export const conceptTopics = (c: Concept): string[] => c.topicIds.map(strip);

/* Concept mastery = existing per-topic mastery (reused, not recomputed) + multi-source evidence gating. */
export function getConceptMastery(stats: PlayerStats, concept: Concept): ConceptEvidence {
  const topics = conceptTopics(concept);
  const topicMastery = getTopicMastery(stats);
  const rows = topics.map(t => topicMastery.find(x => x.topic === t));
  const masteryPct = rows.length ? Math.round(rows.reduce((s, r) => s + (r?.pct ?? 0), 0) / rows.length) : 0;
  const activity = rows.reduce((s, r) => s + (r?.activity ?? 0), 0);

  const lessonCompleted =
    listAll('lessons').some(l => l.conceptIds.includes(concept.id) && stats.completedLessons.includes(l.id)) ||
    Object.values(legacyLessons).some(l => (l as any).conceptIds?.includes(concept.id) && stats.completedLessons.includes(l.id));

  const bank = getPracticeBank();
  const cq = bank.filter(q => q.conceptId === concept.id);
  let practiceAttempts = 0, practiceCorrect = 0;
  for (const q of cq) {
    const rec = (stats.practice as any)[q.id];
    if (rec) { practiceAttempts += rec.tries ?? 0; if (rec.correct) practiceCorrect += 1; }
  }
  const accuracy = cq.length ? Math.round((practiceCorrect / cq.length) * 100) : null;

  const projectCompleted = getProjects(concept.id).some(p => stats.completedProjects.includes(p.id));

  const confs: number[] = [];
  for (const [pid, rec] of Object.entries(stats.problems)) {
    const meta = resolveQuestionMeta(pid);
    const conf = (rec as any)?.confidence;
    if (meta.topicIds.some(t => topics.includes(t)) && typeof conf === 'number' && conf > 0) confs.push(conf);
  }
  const confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null;

  const revisionDue = !!getRevisions(concept.id)[0] && lessonCompleted;

  const criteria = getMasteryCriteria(concept.id);
  const minApps = criteria?.minApplications ?? 2;
  const minAcc = criteria?.minAccuracy ?? 80;

  let tier: MasteryTier;
  if (activity === 0 && !lessonCompleted && practiceAttempts === 0) tier = 'NOT_STARTED';
  else if (practiceCorrect === 0 && !projectCompleted) tier = 'EXPOSED';
  else if (masteryPct < 60 || practiceCorrect < minApps) tier = 'PRACTICING';
  else if (masteryPct < minAcc || practiceCorrect < minApps + 1) tier = 'PROFICIENT';
  else tier = 'MASTERED';

  return { conceptId: concept.id, lessonCompleted, practiceAttempts, practiceCorrect, accuracy, projectCompleted, confidence, revisionDue, masteryPct, tier };
}

/* Revision plan: at-risk concepts -> reuse their PUBLISHED practice items (no duplicate content). */
export interface RevisionPlanItem { concept: Concept; reason: string; questionIds: string[]; }

export function getRevisionPlan(stats: PlayerStats): RevisionPlanItem[] {
  const bank = getPracticeBank();
  const out: RevisionPlanItem[] = [];
  for (const concept of listAll('concepts')) {
    if (concept.status !== 'PUBLISHED') continue;
    const ev = getConceptMastery(stats, concept);
    if (ev.tier === 'NOT_STARTED') continue;
    if (ev.tier === 'MASTERED' && !ev.revisionDue) continue;
    const reasons: string[] = [];
    if (ev.accuracy !== null && ev.accuracy < 80) reasons.push(`accuracy ${ev.accuracy}%`);
    if (ev.practiceAttempts > ev.practiceCorrect) reasons.push(`${ev.practiceAttempts - ev.practiceCorrect} mistaken attempt(s)`);
    if (ev.confidence !== null && ev.confidence < 2) reasons.push(`low confidence (${ev.confidence.toFixed(1)}/3)`);
    if (ev.tier !== 'MASTERED') reasons.push(`mastery ${ev.masteryPct}% (${ev.tier.toLowerCase()})`);
    if (ev.tier === 'MASTERED' && ev.revisionDue) reasons.push('spaced revision due');
    if (reasons.length === 0) continue;
    const qs = bank.filter(q => q.conceptId === concept.id);
    if (qs.length === 0) continue;
    out.push({ concept, reason: reasons.join(', '), questionIds: qs.map(q => q.id) });
  }
  return out;
}
