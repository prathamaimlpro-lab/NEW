import { levels } from '../data/curriculum';
import { lessons } from '../data/lessons';
import { problems } from '../data/problems';
import { getMasteryState, getTopicCompletion } from './masteryService';
import { getNextLesson, isLessonUnlocked } from './progressService';
import { getTopicMastery } from './statsService';
import { Lesson, PlayerStats, Problem } from '../types';

export interface ConceptNode {
  id: string; name: string; worldId: string; levelIds: number[]; lessonIds: string[];
  prerequisiteIds: string[]; dependentIds: string[]; relatedProblemIds: string[];
  mastery: number; completion: number; hasData: boolean;
  state: 'mastered' | 'strong' | 'developing' | 'weak' | 'locked' | 'current' | 'unknown';
}
export interface SkillGraph { nodes: ConceptNode[]; edges: { from: string; to: string }[] }

export function buildSkillGraph(stats: PlayerStats): SkillGraph {
  const pub = Object.values(lessons).filter(l => l.status === 'PUBLISHED');
  const mastery = new Map(getTopicMastery(stats).map(t => [t.topic, t]));
  const completion = new Map(getTopicCompletion(stats).map(t => [t.topic, t]));
  const nodes = new Map<string, ConceptNode>();

  for (const l of pub) {
    const level = levels.find(x => x.id === l.levelId);
    for (const t of l.topics) {
      let n = nodes.get(t);
      if (!n) {
        n = { id: t, name: t, worldId: level?.worldId ?? 'world-1', levelIds: [], lessonIds: [], prerequisiteIds: [], dependentIds: [], relatedProblemIds: [], mastery: 0, completion: 0, hasData: false, state: 'unknown' };
        nodes.set(t, n);
      }
      if (!n.lessonIds.includes(l.id)) n.lessonIds.push(l.id);
      if (level && !n.levelIds.includes(level.number)) n.levelIds.push(level.number);
    }
  }

  const edges: { from: string; to: string }[] = [];
  for (const l of pub) {
    for (const pid of l.prerequisites) {
      const pl = pub.find(x => x.id === pid);
      if (!pl) continue;
      for (const pt of pl.topics) for (const t of l.topics) {
        if (pt === t) continue;
        if (!edges.some(e => e.from === pt && e.to === t)) edges.push({ from: pt, to: t });
      }
    }
  }
  for (const e of edges) {
    const a = nodes.get(e.from); const b = nodes.get(e.to);
    if (a && !a.dependentIds.includes(e.to)) a.dependentIds.push(e.to);
    if (b && !b.prerequisiteIds.includes(e.from)) b.prerequisiteIds.push(e.from);
  }

  for (const p of problems.filter(x => x.status === 'PUBLISHED')) {
    for (const t of p.topics) {
      const n = nodes.get(t);
      if (n && !n.relatedProblemIds.includes(p.id)) n.relatedProblemIds.push(p.id);
    }
  }

  const current = getNextLesson(stats);
  const currentTopics = new Set(current?.topics ?? []);
  for (const n of nodes.values()) {
    const m = mastery.get(n.id); const c = completion.get(n.id);
    n.mastery = m?.pct ?? 0; n.completion = c?.pct ?? 0; n.hasData = (m?.activity ?? 0) > 0;
    if (currentTopics.has(n.id)) n.state = 'current';
    else if (n.hasData) n.state = getMasteryState(n.mastery);
    else {
      const blocked = n.prerequisiteIds.some(pid => { const pn = nodes.get(pid); return !!pn && !pn.hasData; });
      n.state = blocked && n.lessonIds.every(id => !isLessonUnlocked(stats, lessons[id])) ? 'locked' : 'unknown';
    }
  }
  return { nodes: [...nodes.values()], edges };
}

export interface Recommendation { concept: ConceptNode; label: string; detail: string; to: string }

export function recommendFromMastery(stats: PlayerStats, graph: SkillGraph): Recommendation | null {
  const weak = graph.nodes
    .filter(n => n.hasData && n.mastery < 75 && n.lessonIds.some(id => isLessonUnlocked(stats, lessons[id])))
    .sort((a, b) => a.mastery - b.mastery)[0];
  if (!weak) return null;
  const easyOpen = weak.relatedProblemIds.filter(id => {
    const p = problems.find(x => x.id === id);
    return !!p && p.difficulty === 'EASY' && !stats.problems[id]?.solved;
  }).length;
  const lessonId = weak.lessonIds.find(id => !stats.completedLessons.includes(id) && isLessonUnlocked(stats, lessons[id]));
  return {
    concept: weak,
    label: `Review ${weak.name}`,
    detail: easyOpen > 0 ? `Mastery ${weak.mastery}% · ${easyOpen} easy problem${easyOpen === 1 ? '' : 's'} available` : `Mastery ${weak.mastery}%`,
    to: lessonId ? `/learn/lesson/${lessonId}` : '/practice',
  };
}
