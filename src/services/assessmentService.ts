import type { Assessment } from '../content/types';
import { listAll } from './contentService';
import { getPracticeBank, resolveQuestionMeta, type EngineQuestion } from './practiceService';
import { storageService } from './storageService';

/* Additive extension of the existing Assessment schema (all new fields optional). */
export interface AssessmentExt extends Assessment {
  title?: string;
  scope?: 'lesson' | 'level' | 'world';
  levelId?: string;
  worldId?: string;
  blueprint?: string;
  difficultyDistribution?: Partial<Record<'EASY' | 'MEDIUM' | 'HARD', number>>;
  prerequisiteCoverage?: string[];
  scoring?: string;
  remediation?: string;
  masteryWeight?: number;
  version?: string;
}

export interface AssessmentRecord {
  attempts: number;
  lastScore: number;
  passed: boolean;
  version: string;
  conceptsAssessed: string[];
  incorrectConcepts: string[];
  updatedAt: string;
  history: { version: string; score: number; passed: boolean; at: string }[];
}

const KEY = 'pixel_assessment_records_v1';
const read = (): Record<string, AssessmentRecord> => storageService.get<Record<string, AssessmentRecord>>(KEY, {});
const write = (r: Record<string, AssessmentRecord>) => storageService.set(KEY, r);

const all = () => listAll('assessments') as AssessmentExt[];
export const getAssessment = (id: string) => all().find(a => a.id === id);
export const getAssessmentsForLesson = (lessonId: string) => all().filter(a => a.status === 'PUBLISHED' && a.lessonId === lessonId);
export const getAssessmentsForLevel = (levelId: string) => all().filter(a => a.status === 'PUBLISHED' && a.scope === 'level' && a.levelId === levelId);
export const getAssessmentsForWorld = (worldId: string) => all().filter(a => a.status === 'PUBLISHED' && a.scope === 'world' && a.worldId === worldId);
export const getAllAssessments = () => all().filter(a => a.status === 'PUBLISHED');

/* Questions come from the published bank; questionIds order preserves the blueprint. */
export function assessmentQuestions(a: AssessmentExt): EngineQuestion[] {
  const byId = new Map(getPracticeBank().map(q => [q.id, q]));
  return a.questionIds.map(id => byId.get(id)).filter((q): q is EngineQuestion => !!q);
}

export interface ScoreResult { correct: number; total: number; pct: number; passed: boolean; conceptsAssessed: string[]; incorrectConcepts: string[]; }

export function scoreAnswers(a: AssessmentExt, questions: EngineQuestion[], selections: Record<string, number>): ScoreResult {
  let correct = 0;
  const concepts = new Set<string>();
  const incorrect = new Set<string>();
  for (const q of questions) {
    const ok = selections[q.id] === q.answerIndex;
    if (ok) correct++;
    const cid = q.conceptId ?? resolveQuestionMeta(q.id).conceptId;
    if (cid) { concepts.add(cid); if (!ok) incorrect.add(cid); }
  }
  const total = questions.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, pct, passed: pct >= (a.passThreshold ?? 70), conceptsAssessed: [...concepts], incorrectConcepts: [...incorrect] };
}

export function recordAttempt(a: AssessmentExt, res: ScoreResult): AssessmentRecord {
  const store = read();
  const version = a.version ?? '1';
  const prev = store[a.id] ?? { attempts: 0, lastScore: 0, passed: false, version, conceptsAssessed: [], incorrectConcepts: [], updatedAt: '', history: [] };
  const rec: AssessmentRecord = {
    attempts: prev.attempts + 1,
    lastScore: res.pct,
    passed: res.passed,
    version,
    conceptsAssessed: res.conceptsAssessed,
    incorrectConcepts: res.incorrectConcepts,
    updatedAt: new Date().toISOString(),
    history: [...prev.history, { version, score: res.pct, passed: res.passed, at: new Date().toISOString() }].slice(-20),
  };
  store[a.id] = rec;
  write(store);
  return rec;
}
export const getRecord = (id: string): AssessmentRecord | undefined => read()[id];
