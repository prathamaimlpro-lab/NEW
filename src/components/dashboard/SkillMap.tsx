import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessons } from '../../data/lessons';
import { problems } from '../../data/problems';
import { worlds } from '../../data/curriculum';
import { getRevisionDue } from '../../services/progressService';
import { ConceptNode, SkillGraph } from '../../services/skillService';
import { usePlayer } from '../../store/PlayerContext';
import { Problem } from '../../types';
import { EmptyNote, HBar } from './blocks';

const STATE_COLOR: Record<ConceptNode['state'], string> = {
  mastered: 'var(--d-green)',
  strong: 'var(--d-blue)',
  developing: '#94A3B8',
  weak: 'var(--d-orange)',
  locked: '#475569',
  unknown: '#475569',
  current: 'var(--d-indigo)',
};

export function SkillMap({ graph }: { graph: SkillGraph }) {
  const [selId, setSelId] = useState<string | null>(null);
  const sel = selId ? graph.nodes.find(n => n.id === selId) ?? null : null;
  const relIds = useMemo(() => (sel ? new Set([...sel.prerequisiteIds, ...sel.dependentIds]) : null), [sel]);
  const anyData = graph.nodes.some(n => n.hasData);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!anyData && <EmptyNote>New learner — this map is built from the real curriculum structure. Mastery states appear as you complete lessons and practice.</EmptyNote>}

      <div className="dmap" aria-label="Skill map">
        {worlds.map(w => {
          const nodes = graph.nodes.filter(n => n.worldId === w.id);
          if (nodes.length === 0) return null;
          return (
            <div key={w.id} className="dmap-col">
              <div className="dsec" style={{ marginBottom: 2 }}>W{w.number} · {w.title}</div>
              {nodes.map(n => {
                const cls = sel?.id === n.id ? 'sel' : relIds ? (relIds.has(n.id) ? 'rel' : 'dim') : '';
                return (
                  <button
                    key={n.id}
                    type="button"
                    className={`dnode ${cls} ${n.state === 'current' ? 'cur' : ''}`}
                    onClick={() => setSelId(sel?.id === n.id ? null : n.id)}
                    aria-pressed={sel?.id === n.id}
                  >
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                      <span className="dnode-dot" style={{ background: STATE_COLOR[n.state] }} aria-hidden="true" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</span>
                    </span>
                    {n.hasData && <span className="mono t-caption">{n.mastery}%</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }} className="t-caption">
        {(['mastered', 'strong', 'developing', 'weak', 'locked'] as const).map(s => (
          <span key={s} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}>
            <span className="dnode-dot" style={{ background: STATE_COLOR[s] }} aria-hidden="true" /> {s}
          </span>
        ))}
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--d-muted)' }}>
          <span className="dnode-dot" style={{ background: STATE_COLOR.current }} aria-hidden="true" /> current focus
        </span>
      </div>

      {sel && <SkillDetail node={sel} graph={graph} onNavigate={setSelId} />}
    </div>
  );
}

function SkillDetail({ node, graph, onNavigate }: { node: ConceptNode; graph: SkillGraph; onNavigate: (id: string) => void }) {
  const { stats } = usePlayer();
  const relLessons = node.lessonIds.map(id => lessons[id]).filter((l): l is NonNullable<typeof l> => Boolean(l));
  const relProblems = node.relatedProblemIds.map(id => problems.find(p => p.id === id)).filter((p): p is Problem => Boolean(p));
  const attempted = relProblems.filter(p => stats.problems[p.id]).length;
  const solved = relProblems.filter(p => stats.problems[p.id]?.solved).length;
  const prereq = node.prerequisiteIds.map(id => graph.nodes.find(n => n.id === id)).filter((n): n is ConceptNode => Boolean(n));
  const deps = node.dependentIds.map(id => graph.nodes.find(n => n.id === id)).filter((n): n is ConceptNode => Boolean(n));
  const easyOpen = relProblems.filter(p => p.difficulty === 'EASY' && !stats.problems[p.id]?.solved).length;
  const revision = getRevisionDue(stats).find(r => r.kind === 'lesson' && node.lessonIds.includes(r.id));
  const openLesson = relLessons.find(l => !stats.completedLessons.includes(l.id));

  return (
    <div className="dmap-detail">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="t-body" style={{ color: 'var(--d-fg)', fontWeight: 600 }}>{node.name}</span>
        <span className="chip" style={{ textTransform: 'uppercase' }}>{node.state}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <HBar label="Mastery" value={node.mastery} tone={node.mastery >= 75 ? 'var(--d-green)' : node.mastery >= 50 ? 'var(--d-blue)' : 'var(--d-orange)'} />
        <HBar label="Completion" value={node.completion} tone="#94A3B8" />
      </div>

      {prereq.length > 0 && (
        <div>
          <div className="dsec" style={{ marginBottom: 6 }}>PREREQUISITES</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {prereq.map(p => (
              <button key={p.id} type="button" className="chip" onClick={() => onNavigate(p.id)}>
                {p.name} {p.hasData ? `${p.mastery}%` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {deps.length > 0 && (
        <div>
          <div className="dsec" style={{ marginBottom: 6 }}>UNLOCKS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {deps.map(p => (
              <button key={p.id} type="button" className="chip" onClick={() => onNavigate(p.id)}>{p.name}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="dsec" style={{ marginBottom: 6 }}>RELATED LESSONS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {relLessons.map(l => (
            <Link key={l.id} className="t-body-sm" style={{ color: 'var(--d-blue)' }} to={`/learn/lesson/${l.id}`}>
              Level {l.levelId.replace('level-', '')} · {l.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="t-caption" style={{ color: 'var(--d-fg2)' }}>
        Practice: {attempted} attempted · {solved} solved{attempted > 0 ? ` · ${Math.round((solved / attempted) * 100)}% accuracy` : ''}
        {revision ? ' · revision due' : ''}
      </div>

      {(node.hasData && node.mastery < 75) || openLesson ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link className="btn btn-secondary btn-sm" to={openLesson ? `/learn/lesson/${openLesson.id}` : '/practice'}>
            {openLesson ? `Continue ${openLesson.title}` : `Review ${node.name}`}
          </Link>
          {easyOpen > 0 && <Link className="btn btn-ghost btn-sm" to="/practice">{easyOpen} easy problems →</Link>}
        </div>
      ) : null}
    </div>
  );
}
