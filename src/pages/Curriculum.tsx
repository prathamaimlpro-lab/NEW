import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { levels, worlds } from '../data/curriculum';
import {
  getLevel, getLessonProgress, getLevelProgress, getLevelState, getNextLesson, getOverallProgress, getWorldProgress, publishedLessons,
} from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import type { Level, World } from '../types';

type NodeState = 'done' | 'current' | 'available' | 'locked';
type WorldState = 'completed' | 'current' | 'available' | 'locked';

const STATE_LABEL: Record<NodeState, string> = { done: 'Completed', current: 'Current', available: 'Available', locked: 'Locked' };
const WORLD_CHIP: Record<WorldState, string> = { completed: 'chip-success', current: 'chip-info', available: 'chip', locked: 'chip' };

export default function Curriculum() {
  const { stats } = usePlayer();
  const [query, setQuery] = useState('');
  const next = getNextLesson(stats);
  const currentLevel = next ? getLevel(next.levelId) : undefined;
  const currentWorld = currentLevel ? worlds.find(w => w.id === currentLevel.worldId) : undefined;
  const currentLevelId = currentLevel?.id ?? null;
  const [open, setOpen] = useState<Record<string, boolean>>(() => (currentWorld ? { [currentWorld.id]: true } : {}));

  const stateOf = useMemo(() => (l: Level): NodeState => getLevelState(stats, l, currentLevelId), [stats, currentLevelId]);

  const worldState = useMemo(() => (w: World): WorldState => {
    const wl = levels.filter(l => l.worldId === w.id);
    const states = wl.map(stateOf);
    if (states.includes('current')) return 'current';
    const pub = wl.filter(l => publishedLessons(l).length > 0);
    if (pub.length > 0 && pub.every(l => stateOf(l) === 'done')) return 'completed';
    if (states.some(s => s === 'available' || s === 'done')) return 'available';
    return 'locked';
  }, [stateOf]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return levels.filter(l => {
      const w = worlds.find(x => x.id === l.worldId);
      return `${l.title} ${l.description} ${w?.title ?? ''}`.toLowerCase().includes(q);
    });
  }, [query]);

  const overall = getOverallProgress(stats);
  const nextProg = next ? getLessonProgress(stats, next) : 0;

  const renderLevel = (l: Level, showWorld: boolean) => {
    const st = stateOf(l);
    const prog = getLevelProgress(stats, l);
    const lessonsN = publishedLessons(l).length;
    const milestone = l.number % 10 === 0;
    const prereqNumber = l.prerequisites[0]?.replace('level-', '');
    const w = worlds.find(x => x.id === l.worldId);
    const locked = st === 'locked';
    const inner = (
      <>
        <span className="rail" aria-hidden="true">
          {st === 'done' ? <span style={{ color: 'var(--signal-mastered, #10B981)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>✓</span>
            : st === 'current' ? <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--signal-focus, #6366F1)', display: 'inline-block' }} />
            : locked ? <span style={{ color: 'var(--text-subtle, #475569)' }}><Icon name="lock" size={12} /></span>
            : <span style={{ width: 8, height: 8, borderRadius: 999, border: '1px solid var(--border-strong, #2E3444)', display: 'inline-block' }} />}
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="d-micro">LEVEL {l.number}</span>
            {milestone && (
              <span aria-label="Milestone level" style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: 'var(--text-muted, #64748B)', display: 'inline-block', borderRadius: 1 }} />
            )}
            {showWorld && <span className="d-micro" style={{ color: 'var(--text-subtle, #475569)' }}>· {w?.title}</span>}
          </span>
          <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', display: 'block' }}>{l.title}</span>
          <span className="d-micro" style={{ display: 'block', marginTop: 2, color: 'var(--text-muted, #64748B)' }}>
            {locked
              ? (prereqNumber ? `Complete Level ${prereqNumber} to unlock.` : 'Complete earlier levels to unlock.')
              : lessonsN === 0
                ? 'Lessons in authoring'
                : `${lessonsN} lesson${lessonsN === 1 ? '' : 's'}${prog > 0 ? ` · ${prog}%` : ''}`}
          </span>
        </span>
        <span className={`chip ${st === 'done' ? 'chip-success' : st === 'current' ? 'chip-info' : 'chip'}`}>{STATE_LABEL[st]}</span>
      </>
    );
    return locked ? (
      <div key={l.id} className="lrow" style={{ opacity: 0.55, cursor: 'not-allowed' }} aria-disabled="true" aria-label={`Level ${l.number}: ${l.title} — Locked`}>
        {inner}
      </div>
    ) : (
      <Link key={l.id} className="lrow" to={`/learn/level/${l.id}`} aria-label={`Level ${l.number}: ${l.title} — ${STATE_LABEL[st]}`}>
        {inner}
      </Link>
    );
  };

  return (
    <>
      <header style={{ padding: '24px 2px 0' }}>
        <div className="d-eyebrow" style={{ marginBottom: 8 }}>Curriculum</div>
        <h1 className="d-h1" style={{ fontSize: 28, lineHeight: '36px' }}>{worlds.length} Worlds · {levels.length} Levels</h1>
        <p className="d-body" style={{ marginTop: 8, maxWidth: 640 }}>
          Worlds group the journey; levels are the progression units. Open a world to inspect its levels, prerequisites and milestones.
        </p>
      </header>

      <section className="p-strip" style={{ border: '1px solid var(--border-subtle, #232732)', borderRadius: 6 }}>
        <div><span className="d-big">{currentWorld ? `W${currentWorld.number}` : '—'}</span><span className="lbl">{currentWorld ? currentWorld.title : 'No position yet'}</span></div>
        <div><span className="d-big">L{currentLevel?.number ?? 0}</span><span className="lbl">Current level</span></div>
        <div><span className="d-big">{overall}%</span><span className="lbl">Overall progress</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          {next && (
            <>
              <Link className="cta-solid" style={{ minHeight: 36, fontSize: 13 }} to={`/learn/lesson/${next.id}`}>
                {nextProg > 0 ? 'Continue Lesson' : 'Start Lesson'}
              </Link>
              <span className="d-micro" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{next.title}</span>
            </>
          )}
        </div>
      </section>

      <section>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search levels or worlds…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search levels" />
      </section>

      {query.trim() !== '' ? (
        <section className="p-map">
          <div className="p-head">
            <span className="d-eyebrow">Search results</span>
            <span className="d-micro">{matches.length} level{matches.length === 1 ? '' : 's'}</span>
          </div>
          {matches.length === 0 ? <div className="dempty">No levels match “{query}”. Try a different topic or level name.</div> : matches.map(l => renderLevel(l, true))}
        </section>
      ) : (
        worlds.map(w => {
          const wl = levels.filter(l => l.worldId === w.id);
          const st = worldState(w);
          const done = wl.filter(l => stateOf(l) === 'done').length;
          const isOpen = open[w.id] ?? false;
          const allAuthoring = wl.every(l => publishedLessons(l).length === 0);
          return (
            <section key={w.id} className="p-map" style={{ padding: 0 }}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`world-${w.id}-levels`}
                onClick={() => setOpen(o => ({ ...o, [w.id]: !o[w.id] }))}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16, background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', flexWrap: 'wrap' }}
              >
                <span style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  <span aria-hidden="true" style={{ color: 'var(--text-secondary, #94A3B8)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>
                    <Icon name="chevron-right" size={14} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="d-title" style={{ display: 'block' }}>W{w.number} · {w.title}</span>
                    <span className="d-micro" style={{ display: 'block', marginTop: 2, color: 'var(--text-muted, #64748B)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.description}
                    </span>
                  </span>
                </span>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="d-micro">{done}/{wl.length} levels · {getWorldProgress(stats, w.id)}%</span>
                  <span className={`chip ${WORLD_CHIP[st]}`}>{st === 'completed' ? 'Completed' : st === 'current' ? 'Current' : st === 'available' ? 'Available' : 'Locked'}</span>
                </span>
              </button>
              {isOpen && (
                <div id={`world-${w.id}-levels`} style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column' }}>
                  {allAuthoring ? <div className="dempty">Lessons for this world are in authoring and will appear here once published.</div> : wl.map(l => renderLevel(l, false))}
                </div>
              )}
            </section>
          );
        })
      )}
    </>
  );
}
