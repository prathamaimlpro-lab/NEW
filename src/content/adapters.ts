import { levels as legacyLevels, worlds as legacyWorlds } from '../data/curriculum';
import { lessons as legacyLessons } from '../data/lessons';
import { level1Concepts, level1Examples, level1Mastery, level1Practice, level1Projects, level1Revisions, level1Visuals } from './level1';
import type { ContentBundle, ContentStatus, Concept, ConceptFacet, Lesson, Level, Topic, World } from './types';

const NOW = '2026-01-01T00:00:00.000Z';
const st = (x: any): ContentStatus => (x?.status ?? 'PUBLISHED');

const LEVEL1_LESSON_ID = 'what-is-a-computer';

export function buildBundle(): ContentBundle {
  const worlds: World[] = legacyWorlds.map(w => ({
    id: w.id, status: st(w), updatedAt: NOW, number: w.number, title: w.title, description: w.description ?? '',
    levelIds: legacyLevels.filter(l => l.worldId === w.id).map(l => l.id),
  }));

  const levels: Level[] = legacyLevels.map(l => ({
    id: l.id, status: st(l), updatedAt: NOW, number: l.number, worldId: l.worldId, title: l.title,
    description: l.description ?? '', lessonIds: l.lessons ?? [], estimatedHours: l.estimatedHours ?? 0,
    milestone: l.number % 10 === 0, prerequisites: l.prerequisites ?? [],
  }));

  const lessons: Lesson[] = Object.values(legacyLessons).map((x: any) => ({
    id: x.id, status: st(x), updatedAt: NOW, levelId: x.levelId, order: x.order ?? 0, title: x.title,
    summary: x.description ?? '', topicIds: ((x.topics ?? []) as string[]).map(t => `topic:${t}`),
    conceptIds: x.id === LEVEL1_LESSON_ID ? level1Concepts.map(c => c.id) : [],
    estimatedMinutes: x.estimatedMinutes ?? 0, xp: x.xpReward ?? 0,
  }));

  const topicNames = [...new Set(Object.values(legacyLessons).flatMap((l: any) => (l.topics ?? []) as string[]))];
  const topics: Topic[] = topicNames.map(name => ({
    id: `topic:${name}`, status: 'PUBLISHED', updatedAt: NOW, title: name,
    conceptIds: level1Concepts.filter(c => c.topicIds.includes(`topic:${name}`)).map(c => c.id),
  }));

  return {
    worlds, levels, lessons, topics,
    concepts: level1Concepts, examples: level1Examples, visuals: level1Visuals,
    practice: level1Practice, projects: level1Projects, revisions: level1Revisions,
    assessments: [], mastery: level1Mastery,
  };
}

export function conceptToBlocks(c: Concept): { type: string; title?: string; body?: string; bullets?: string[]; code?: string }[] {
  const out: { type: string; title?: string; body?: string; bullets?: string[]; code?: string }[] = [];
  for (const f of c.facets) {
    if (f.code) out.push({ type: 'code', title: facetLabel(f.key), code: f.code, body: f.body });
    else if (f.bullets?.length) out.push({ type: 'list', title: facetLabel(f.key), bullets: f.bullets });
    else out.push({ type: 'definition', title: facetLabel(f.key), body: f.body });
  }
  return out;
}
function facetLabel(k: ConceptFacet['key']): string {
  return k === 'REAL_WORLD' ? 'Real world' : k.charAt(0) + k.slice(1).toLowerCase();
}
