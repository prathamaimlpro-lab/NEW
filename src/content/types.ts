export type ContentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED';
export const LIFECYCLE: ContentStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'DEPRECATED', 'ARCHIVED'];

export interface BaseEntity { id: string; status: ContentStatus; updatedAt: string }
export interface World extends BaseEntity { number: number; title: string; description: string; levelIds: string[] }
export interface Level extends BaseEntity { number: number; worldId: string; title: string; description: string; lessonIds: string[]; estimatedHours: number; milestone: boolean; prerequisites: string[] }
export interface Lesson extends BaseEntity { levelId: string; order: number; title: string; summary: string; topicIds: string[]; conceptIds: string[]; estimatedMinutes: number; xp: number }
export interface Topic extends BaseEntity { title: string; conceptIds: string[] }

export type ConceptFacetKey = 'WHAT' | 'WHY' | 'HOW' | 'INTERNALS' | 'EXAMPLE' | 'MISTAKES' | 'PRACTICE' | 'REAL_WORLD' | 'CONNECTIONS';
export interface ConceptFacet { key: ConceptFacetKey; body: string; bullets?: string[]; code?: string }
export interface Concept extends BaseEntity {
  title: string; topicIds: string[]; facets: ConceptFacet[];
  exampleIds: string[]; visualIds: string[]; practiceIds: string[]; projectIds: string[]; revisionIds: string[];
  prerequisiteConceptIds: string[]; masteryCriteriaId?: string;
}

export interface Example extends BaseEntity { conceptId: string; title: string; kind: 'code' | 'analogy' | 'scenario'; body: string; code?: string }
export interface Visual extends BaseEntity { conceptId: string; visualizationId: string; caption: string }
export interface PracticeQuestion extends BaseEntity { conceptId: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD'; prompt: string; options: string[]; answerIndex: number; explanation: string }
export interface Project extends BaseEntity { conceptIds: string[]; title: string; summary: string; requirements: string[]; xp: number }
export interface Revision extends BaseEntity { conceptId: string; intervalDays: number; prompt: string }
export interface Assessment extends BaseEntity { lessonId: string; questionIds: string[]; passThreshold: number }
export interface MasteryCriteria extends BaseEntity { conceptId: string; minAccuracy: number; minApplications: number; requiresRevision: boolean; description: string }

export interface ContentBundle {
  worlds: World[]; levels: Level[]; lessons: Lesson[]; topics: Topic[]; concepts: Concept[];
  examples: Example[]; visuals: Visual[]; practice: PracticeQuestion[]; projects: Project[];
  revisions: Revision[]; assessments: Assessment[]; mastery: MasteryCriteria[];
}
