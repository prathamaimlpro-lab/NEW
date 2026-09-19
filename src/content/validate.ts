import { LIFECYCLE, type ContentBundle } from './types';

export interface ContentIssue { severity: 'error' | 'warn'; code: string; message: string; ref?: string }

export function validateContent(b: ContentBundle): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const err = (code: string, message: string, ref?: string) => issues.push({ severity: 'error', code, message, ref });
  const warn = (code: string, message: string, ref?: string) => issues.push({ severity: 'warn', code, message, ref });

  const all = [
    ...b.worlds, ...b.levels, ...b.lessons, ...b.topics, ...b.concepts, ...b.examples,
    ...b.visuals, ...b.practice, ...b.projects, ...b.revisions, ...b.assessments, ...b.mastery,
  ];
  const seen = new Set<string>();
  for (const e of all) {
    if (seen.has(e.id)) err('DUPLICATE_ID', `Duplicate id "${e.id}"`, e.id);
    seen.add(e.id);
    if (!LIFECYCLE.includes(e.status)) err('INVALID_STATUS', `Bad status "${e.status}" on "${e.id}"`, e.id);
  }

  const worldIds = new Set(b.worlds.map(w => w.id));
  const levelIds = new Set(b.levels.map(l => l.id));
  const lessonIds = new Set(b.lessons.map(l => l.id));
  const conceptIds = new Set(b.concepts.map(c => c.id));

  for (const l of b.levels) {
    if (!worldIds.has(l.worldId)) err('BROKEN_REF', `Level "${l.id}" references missing world "${l.worldId}"`, l.id);
    for (const id of l.lessonIds) if (!lessonIds.has(id)) err('BROKEN_REF', `Level "${l.id}" references missing lesson "${id}"`, l.id);
    if (!l.title) err('MISSING_FIELD', `Level "${l.id}" missing title`, l.id);
  }
  for (const les of b.lessons) {
    if (!levelIds.has(les.levelId)) err('BROKEN_REF', `Lesson "${les.id}" references missing level "${les.levelId}"`, les.id);
    if (!les.title) err('MISSING_FIELD', `Lesson "${les.id}" missing title`, les.id);
    const dup = les.conceptIds.filter((c, i) => les.conceptIds.indexOf(c) !== i);
    if (dup.length) err('DUPLICATE_CONCEPT_REF', `Lesson "${les.id}" duplicates concept refs`, les.id);
    for (const c of les.conceptIds) {
      if (!conceptIds.has(c)) err('BROKEN_REF', `Lesson "${les.id}" references missing concept "${c}"`, les.id);
      else if (les.status === 'PUBLISHED') {
        const con = b.concepts.find(x => x.id === c)!;
        if (con.status !== 'PUBLISHED') err('UNPUBLISHED_DEPENDENCY', `Published lesson "${les.id}" depends on ${con.status} concept "${c}"`, les.id);
      }
    }
  }
  for (const w of b.worlds) {
    for (const id of w.levelIds) if (!levelIds.has(id)) err('BROKEN_REF', `World "${w.id}" references missing level "${id}"`, w.id);
    if (!w.title) err('MISSING_FIELD', `World "${w.id}" missing title`, w.id);
  }
  for (const c of b.concepts) {
    if (!c.title) err('MISSING_FIELD', `Concept "${c.id}" missing title`, c.id);
    if (c.facets.length === 0) warn('EMPTY_FACETS', `Concept "${c.id}" has no facets`, c.id);
    for (const id of c.exampleIds) if (!b.examples.some(e => e.id === id && e.conceptId === c.id)) err('BROKEN_REF', `Concept "${c.id}" bad example ref "${id}"`, c.id);
    for (const id of c.practiceIds) if (!b.practice.some(p => p.id === id && p.conceptId === c.id)) err('BROKEN_REF', `Concept "${c.id}" bad practice ref "${id}"`, c.id);
    for (const id of c.visualIds) if (!b.visuals.some(v => v.id === id && v.conceptId === c.id)) err('BROKEN_REF', `Concept "${c.id}" bad visual ref "${id}"`, c.id);
    for (const id of c.prerequisiteConceptIds) if (!conceptIds.has(id)) err('BROKEN_REF', `Concept "${c.id}" bad prerequisite "${id}"`, c.id);
    if (c.masteryCriteriaId && !b.mastery.some(m => m.id === c.masteryCriteriaId)) err('BROKEN_REF', `Concept "${c.id}" bad mastery ref`, c.id);
  }
  for (const p of b.practice) {
    if (p.options.length < 2 || p.answerIndex < 0 || p.answerIndex >= p.options.length) err('INVALID_FIELD', `Practice "${p.id}" bad options/answer`, p.id);
  }
  return issues;
}
