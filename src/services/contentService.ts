import { buildBundle } from '../content/adapters';
import { validateContent, type ContentIssue } from '../content/validate';
import type { Concept, ContentBundle, Example, Lesson, Level, MasteryCriteria, PracticeQuestion, Project, Revision, Visual, World } from '../content/types';

let cache: ContentBundle | null = null;

export function getContent(): ContentBundle {
  if (!cache) {
    cache = buildBundle();
    if (import.meta.env.DEV) {
      const issues = validateContent(cache).filter(i => i.severity === 'error');
      if (issues.length) console.warn('[content] validation errors:', issues);
    }
  }
  return cache;
}
export const validate = (): ContentIssue[] => validateContent(getContent());

const pub = <T extends { status: string }>(xs: T[]) => xs.filter(x => x.status === 'PUBLISHED');

/* Learner-facing getters: PUBLISHED only. */
export const listWorlds = (): World[] => pub(getContent().worlds);
export const listLevels = (worldId?: string): Level[] => pub(getContent().levels).filter(l => !worldId || l.worldId === worldId);
export const getLevel = (id: string): Level | undefined => getContent().levels.find(l => l.id === id);
export const listLessons = (levelId: string): Lesson[] => pub(getContent().lessons).filter(l => l.levelId === levelId).sort((a, b) => a.order - b.order);
export const getLesson = (id: string): Lesson | undefined => getContent().lessons.find(l => l.id === id);
export const getConceptsForLesson = (id: string): Concept[] => {
  const les = getLesson(id); if (!les) return [];
  return les.conceptIds.map(c => getContent().concepts.find(x => x.id === c)).filter((c): c is Concept => !!c && c.status === 'PUBLISHED');
};
export const getConcept = (id: string): Concept | undefined => getContent().concepts.find(c => c.id === id);
export const getExamples = (conceptId: string): Example[] => pub(getContent().examples).filter(e => e.conceptId === conceptId);
export const getVisuals = (conceptId: string): Visual[] => pub(getContent().visuals).filter(v => v.conceptId === conceptId);
export const getPractice = (conceptId: string): PracticeQuestion[] => pub(getContent().practice).filter(p => p.conceptId === conceptId);
export const getProjects = (conceptId?: string): Project[] => pub(getContent().projects).filter(p => !conceptId || p.conceptIds.includes(conceptId));
export const getRevisions = (conceptId: string): Revision[] => pub(getContent().revisions).filter(r => r.conceptId === conceptId);
export const getMasteryCriteria = (conceptId: string): MasteryCriteria | undefined => pub(getContent().mastery).find(m => m.conceptId === conceptId);
