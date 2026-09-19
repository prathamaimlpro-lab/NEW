import { listAll } from './contentService';
import { lessons as legacyLessons } from '../data/lessons';
import { problems as legacyProblems } from '../data/problems';
import type { PracticeQuestion } from '../content/types';

/* Engine-ready question shape accepted by the EXISTING PracticeEngine. */
export interface EngineQuestion {
  id: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  prompt?: string;
  options: string[];
  answerIndex: number;
  correctIndex?: number;
  correct?: number;
  explanation: string;
  xp: number;
  conceptId?: string;
  topics?: string[];
  lessonId?: string;
  type?: string;
}

const strip = (t: string) => t.replace('topic:', '');

const contentToEngine = (p: PracticeQuestion, topics: string[]): EngineQuestion => ({
  id: p.id,
  difficulty: p.difficulty,
  question: p.prompt,
  prompt: p.prompt,
  options: p.options,
  answerIndex: p.answerIndex,
  correctIndex: p.answerIndex,
  correct: p.answerIndex,
  explanation: p.explanation,
  xp: 10,
  conceptId: p.conceptId,
  topics,
});

/* One bank: published content-system practice first (concept-linked), then legacy
   published lesson practice. PUBLISHED only. De-duplicated by id. */
export function getPracticeBank(difficulty?: string): EngineQuestion[] {
  const out: EngineQuestion[] = [];
  const seen = new Set<string>();

  const concepts = listAll('concepts');
  const topicsOf = new Map(concepts.map(c => [c.id, c.topicIds.map(strip)]));
  for (const q of listAll('practice')) {
    if (q.status !== 'PUBLISHED' || seen.has(q.id)) continue;
    if (difficulty && q.difficulty !== difficulty) continue;
    seen.add(q.id);
    out.push(contentToEngine(q, topicsOf.get(q.conceptId) ?? []));
  }

  for (const lesson of Object.values(legacyLessons)) {
    const st = (lesson as any).status;
    if (st && st !== 'PUBLISHED') continue;
    for (const q of (lesson.practice ?? [])) {
      if (seen.has(q.id)) continue;
      if (difficulty && q.difficulty !== difficulty) continue;
      seen.add(q.id);
      out.push({ ...(q as any), lessonId: lesson.id, topics: (lesson.topics ?? []) });
    }
  }
  return out;
}

/* On-demand linkage: question → concept / topics / lesson. No stored duplicate,
   so practice records stay exactly as the existing progress model defines them. */
export function resolveQuestionMeta(id: string): { conceptId?: string; topicIds: string[]; lessonId?: string } {
  const cq = listAll('practice').find(p => p.id === id);
  if (cq) {
    const concept = listAll('concepts').find(c => c.id === cq.conceptId);
    return { conceptId: cq.conceptId, topicIds: concept?.topicIds.map(strip) ?? [] };
  }
  for (const lesson of Object.values(legacyLessons)) {
    const inPractice = (lesson.practice ?? []).some(q => q.id === id);
    const inMastery = (lesson.masteryTest ?? []).some(q => q.id === id);
    if (inPractice || inMastery) return { topicIds: lesson.topics ?? [], lessonId: lesson.id };
  }
  const prob = (legacyProblems as any[]).find(p => p.id === id);
  if (prob) return { topicIds: prob.topics ?? [] };
  return { topicIds: [] };
}
