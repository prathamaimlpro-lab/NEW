import type { Concept } from '../content/types';
import type { PlayerStats } from '../types';
import { getConcept, getConceptsForLesson, listAll } from '../services/contentService';
import { getConceptMastery } from '../services/conceptMastery';
import { getPractice } from '../services/contentService';
import { getTopicCompletion } from '../services/masteryService';
import { getTopicMastery } from '../services/statsService';
import { resolveQuestionMeta } from '../services/practiceService';
import { getCurrentLearningState } from '../services/dashboardService';
import { levels as legacyLevels } from '../data/curriculum';
import { lessons as legacyLessons } from '../data/lessons';

export type GraphNodeStatus = 'mastered' | 'in-progress' | 'available' | 'locked' | 'current';
export interface GraphNode { id: string; title: string; status: GraphNodeStatus; mastery: number | null; completion: number | null; worldNumber: number; }
export interface GraphEdge { from: string; to: string; kind: 'prerequisite' | 'related'; }

const strip = (t: string) => t.replace('topic:', '');

function conceptWorld(c: Concept): number {
  const lesson = Object.values(legacyLessons).find(l => (l as any).conceptIds?.includes(c.id));
  const level = lesson ? legacyLevels.find(x => x.id === lesson.levelId) : undefined;
  return level ? level.number : 0;
}

export function buildConceptGraph(stats: PlayerStats): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const concepts = listAll('concepts').filter(c => c.status === 'PUBLISHED');
  const topicMastery = getTopicMastery(stats);
  const topicCompletion = getTopicCompletion(stats);
  const cont = getCurrentLearningState(stats);
  const currentIds = new Set(cont ? getConceptsForLesson(cont.lessonId).map(c => c.id) : []);

  const nodes: GraphNode[] = concepts.map(c => {
    const topics = c.topicIds.map(strip);
    const mastery = topics.length ? Math.round(topics.reduce((s, t) => s + (topicMastery.find(x => x.topic === t)?.pct ?? 0), 0) / topics.length) : null;
    const completion = topics.length ? Math.round(topics.reduce((s, t) => s + (topicCompletion.find(x => x.topic === t)?.pct ?? 0), 0) / topics.length) : null;
    const ev = getConceptMastery(stats, c);
    const prereqOk = c.prerequisiteConceptIds.every(pid => {
      const pc = getConcept(pid);
      if (!pc) return true;
      return getConceptMastery(stats, pc).tier !== 'NOT_STARTED';
    });
    let status: GraphNodeStatus;
    if (currentIds.has(c.id)) status = 'current';
    else if (ev.tier === 'MASTERED') status = 'mastered';
    else if (ev.tier === 'PRACTICING' || ev.tier === 'PROFICIENT' || (completion ?? 0) > 0) status = 'in-progress';
    else if (prereqOk) status = 'available';
    else status = 'locked';
    return { id: c.id, title: c.title, status, mastery, completion, worldNumber: conceptWorld(c) };
  });

  const ids = new Set(nodes.map(n => n.id));
  const edges: GraphEdge[] = [];
  for (const c of concepts) {
    for (const pid of c.prerequisiteConceptIds) {
      if (ids.has(pid) && ids.has(c.id)) edges.push({ from: pid, to: c.id, kind: 'prerequisite' });
    }
  }
  const prereqPairs = new Set(edges.map(e => `${e.from}|${e.to}`));
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const a = concepts[i], b = concepts[j];
      const shared = a.topicIds.some(t => b.topicIds.includes(t));
      if (shared && !prereqPairs.has(`${a.id}|${b.id}`) && !prereqPairs.has(`${b.id}|${a.id}`)) {
        edges.push({ from: a.id, to: b.id, kind: 'related' });
      }
    }
  }
  return { nodes, edges };
}

export interface ConceptInspector {
  concept: Concept; mastery: number | null; completion: number | null;
  accuracy: number | null; confidence: number | null;
  prereqs: { id: string; title: string; status: GraphNodeStatus }[];
  dependents: { id: string; title: string }[];
  nextAction: string;
}

export function conceptInspector(stats: PlayerStats, id: string, nodes: GraphNode[]): ConceptInspector | null {
  const concept = getConcept(id);
  if (!concept) return null;
  const node = nodes.find(n => n.id === id);
  const practice = getPractice(id);
  let att = 0, cor = 0;
  for (const q of practice) { const r = (stats.practice as any)[q.id]; if (r) { att += r.tries ?? 0; if (r.correct) cor += 1; } }
  const accuracy = practice.length ? Math.round((cor / practice.length) * 100) : null;
  const topics = concept.topicIds.map(strip);
  const confs: number[] = [];
  for (const [pid, rec] of Object.entries(stats.problems)) {
    const meta = resolveQuestionMeta(pid);
    const conf = (rec as any)?.confidence;
    if (meta.topicIds.some(t => topics.includes(t)) && typeof conf === 'number' && conf > 0) confs.push(conf);
  }
  const confidence = confs.length ? +(confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(1) : null;
  const statusOf = (cid: string): GraphNodeStatus => nodes.find(n => n.id === cid)?.status ?? 'available';
  const prereqs = concept.prerequisiteConceptIds.map(pid => ({ id: pid, title: getConcept(pid)?.title ?? pid, status: statusOf(pid) }));
  const dependents = listAll('concepts').filter(c => c.prerequisiteConceptIds.includes(id)).map(c => ({ id: c.id, title: c.title }));
  let nextAction: string;
  if (node?.status === 'locked') nextAction = `Complete prerequisites: ${prereqs.map(p => p.title).join(', ') || '—'}`;
  else if (node?.status === 'available') nextAction = 'Open the lesson that introduces this concept';
  else if (node?.status === 'mastered') nextAction = 'Maintain via spaced revision';
  else nextAction = `Practice this concept (${accuracy === null ? 'no attempts yet' : `${accuracy}% accuracy`})`;
  return { concept, mastery: node?.mastery ?? null, completion: node?.completion ?? null, accuracy, confidence, prereqs, dependents, nextAction };
}
