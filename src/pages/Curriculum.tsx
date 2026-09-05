import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, Progress } from '../components/common/ui';
import { levels, worlds } from '../data/curriculum';
import { getCompletedLevelCount, getLevelProgress, getNextLesson, getOverallProgress, getTotalEstimatedHours, isLevelCompleted, isLevelUnlocked, publishedLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';

export default function Curriculum() {
  const { stats } = usePlayer();
  const [worldFilter, setWorldFilter] = useState<'all' | number>('all');
  const [filter, setFilter] = useState('');
  const [specOpen, setSpecOpen] = useState(false);

  const next = getNextLesson(stats);
  const currentLevel = next ? levels.find(l => l.id === next.levelId) : undefined;
  const visibleWorlds = worlds.filter(w => worldFilter === 'all' || w.number === worldFilter);

  const levelState = (n: number) => {
    const l = levels.find(x => x.number === n)!;
    if (isLevelCompleted(stats, l)) return 'completed';
    if (!isLevelUnlocked(stats, l)) return 'locked';
    if (publishedLessons(l).length === 0) return 'authoring';
    if (getLevelProgress(stats, l) > 0) return 'in-progress';
    return 'available';
  };

  const shown = useMemo(() => levels.filter(l => filter.trim() === '' || (l.title + l.description).toLowerCase().includes(filter.toLowerCase())), [filter]);

  return (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,1fr)', gap: 24, alignItems: 'center' }} className="curr-head">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Chip tone="success">● Active Track</Chip><span className="label-mono">/ 13 WORLDS · 100 LEVELS</span>
          </div>
          <h1 className="t-display" style={{ marginBottom: 12 }}>Curriculum Roadmap</h1>
          <p className="t-body-lg" style={{ maxWidth: 560 }}>Methodical, systems-first engineering roadmap from fundamental architecture up to distributed systems.</p>
        </div>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 24, justifyContent: 'space-between' }}>
          <div><div className="label-mono">OVERALL TRACK</div><div className="t-hmd" style={{ marginTop: 8 }}>{getCompletedLevelCount(stats)} <span className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>/ 100 Levels</span></div></div>
          <div><div className="label-mono">COMPLETED</div><div className="t-hmd" style={{ marginTop: 8, color: 'var(--success)' }}>{getOverallProgress(stats)}%</div></div>
          <div><div className="label-mono">EST. DURATION</div><div className="t-hmd" style={{ marginTop: 8 }}>{getTotalEstimatedHours()} <span className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Hours</span></div></div>
        </div>
      </section>

      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', overflowX: 'auto', maxWidth: '100%' }}>
          <button className={`btn btn-sm ${worldFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`} style={worldFilter === 'all' ? { background: 'var(--overlay)', borderColor: 'var(--border-strong)' } : {}} onClick={() => setWorldFilter('all')}>All Worlds</button>
          {worlds.map(w => (
            <button key={w.id} className={`btn btn-sm ${worldFilter === w.number ? 'btn-secondary' : 'btn-ghost'}`} style={worldFilter === w.number ? { background: 'var(--overlay)', borderColor: 'var(--border-strong)' } : {}} onClick={() => setWorldFilter(w.number)} aria-pressed={worldFilter === w.number}>W{String(w.number).padStart(2, '0')}</button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: 220, flex: '0 1 260px' }}>
          <input className="input" placeholder="Filter levels…" value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter levels" />
        </div>
      </section>

      {currentLevel && (
        <section className="card" style={{ borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center' }} className="curr-current">
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <Chip tone="primary">● CURRENT IN-PROGRESS</Chip>
                <span className="label-mono">LEVEL {String(currentLevel.number).padStart(2, '0')} · WORLD {String(worlds.find(w => w.id === currentLevel.worldId)?.number).padStart(2, '0')}</span>
              </div>
              <h2 className="t-hlg" style={{ marginBottom: 8 }}>{currentLevel.title}</h2>
              <p className="t-body clamp-2" style={{ maxWidth: 640 }}>{currentLevel.description}</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }} className="t-body-sm">
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="clock" size={14} /> {currentLevel.estimatedHours} Hours estimated</span>
                <span style={{ color: 'var(--success)' }}>{getLevelProgress(stats, currentLevel)}% Done</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', textAlign: 'right' }}>
              {next && <><span className="t-caption" style={{ color: 'var(--fg-muted)' }}>Next milestone</span><span className="t-body" style={{ color: 'var(--fg-primary)', maxWidth: 220 }}>{next.title}</span></>}
              <Link className="btn btn-primary" to={next ? `/learn/lesson/${next.id}` : `/learn/level/${currentLevel.id}`}>Resume Study <Icon name="arrow-right" size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {visibleWorlds.map(w => {
        const wLevels = shown.filter(l => l.worldId === w.id);
        if (wLevels.length === 0) return null;
        return (
          <section key={w.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <div><span className="label-mono">WORLD {String(w.number).padStart(2, '0')} · LEVELS {w.levelRange[0]}–{w.levelRange[1]}</span><h2 className="t-hmd" style={{ marginTop: 4 }}>{w.title}</h2></div>
              <div style={{ minWidth: 180, flex: '0 1 220px' }}><Progress value={wLevels.filter(l => levelState(l.number) === 'completed').length / wLevels.length * 100} /></div>
            </div>
            <p className="t-body-sm" style={{ marginBottom: 16, maxWidth: 720, color: 'var(--fg-muted)' }}>{w.description}</p>
            <div className="grid-3">
              {wLevels.map(l => {
                const st = levelState(l.number);
                return (
                  <Link key={l.id} to={st === 'locked' ? '#' : `/learn/level/${l.id}`} aria-disabled={st === 'locked'} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: st === 'locked' ? .6 : 1, cursor: st === 'locked' ? 'not-allowed' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="label-mono">LEVEL {String(l.number).padStart(2, '0')}</span>
                      {st === 'completed' ? <Chip tone="success" icon="check">DONE</Chip> : st === 'in-progress' ? <Chip tone="primary">IN PROGRESS</Chip> : st === 'authoring' ? <Chip tone="warning">IN AUTHORING</Chip> : st === 'locked' ? <span style={{ color: 'var(--fg-muted)' }}><Icon name="lock" size={14} /></span> : <Chip>UP NEXT</Chip>}
                    </div>
                    <h3 className="t-hsm">{l.title}</h3>
                    <p className="t-body-sm clamp-3" style={{ flex: 1 }}>{l.description}</p>
                    <hr className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }} className="t-caption">
                      <span>{l.estimatedHours} Hours · {publishedLessons(l).length} lessons</span>
                      <span style={{ color: st === 'locked' ? 'var(--fg-muted)' : 'var(--success)' }}>{st === 'locked' ? `Requires Level ${l.number - 1}` : `${getLevelProgress(stats, l)}%`}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 20, alignItems: 'center' }} className="curr-foot">
        <span className="chip" style={{ padding: 10 }}><Icon name="cpu" size={18} /></span>
        <div>
          <h3 className="t-hsm" style={{ marginBottom: 6 }}>Deterministic Mastery Engine</h3>
          <p className="t-body-sm clamp-2">Progression across 100 levels is unlocked solely through verified completion of prior modules. Levels without published lessons are marked “In Authoring”.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setSpecOpen(true)}>Read Syllabus Spec</button>
          {currentLevel && <Link className="btn btn-primary" to={`/learn/level/${currentLevel.id}`}>Continue Level {String(currentLevel.number).padStart(2, '0')}</Link>}
        </div>
      </section>

      {specOpen && (
        <div className="dialog-scrim" onClick={() => setSpecOpen(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()} role="dialog" aria-label="Syllabus specification">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="label-mono">SYLLABUS SPEC // 13 WORLDS · 100 LEVELS</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSpecOpen(false)} aria-label="Close"><Icon name="x" size={16} /></button>
            </div>
            <div style={{ padding: 12 }}>
              {worlds.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="t-body" style={{ color: 'var(--fg-secondary)' }}><span className="mono" style={{ color: 'var(--fg-muted)' }}>W{String(w.number).padStart(2, '0')}</span> · {w.title} <span className="mono t-caption" style={{ color: 'var(--fg-subtle)' }}>L{w.levelRange[0]}–{w.levelRange[1]}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@media (max-width: 1023px){ .curr-head,.curr-current{grid-template-columns:1fr !important;} .curr-foot{grid-template-columns:1fr !important;} }`}</style>
    </>
  );
}
