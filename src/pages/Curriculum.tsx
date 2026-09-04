import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { Chip, Progress } from '../components/common/ui';
import { levels } from '../data/curriculum';
import { getLevelProgress, getNextLesson, getOverallProgress, getTotalEstimatedHours, isLevelUnlocked, levelLessons } from '../services/progressService';
import { usePlayer } from '../store/PlayerContext';
import { LevelGroup } from '../types';

const TABS: { id: 'all' | LevelGroup; label: string }[] = [
  { id: 'all', label: 'All 14 Levels' }, { id: 'foundations', label: 'Foundations (0–3)' },
  { id: 'systems', label: 'Systems & Data (4–6)' }, { id: 'software', label: 'Software Eng (7–9)' },
  { id: 'advanced', label: 'Advanced & AI (10–13)' },
];

export default function Curriculum() {
  const { stats } = usePlayer();
  const [tab, setTab] = useState<'all' | LevelGroup>('all');
  const [filter, setFilter] = useState('');
  const [specOpen, setSpecOpen] = useState(false);

  const overall = getOverallProgress(stats);
  const completedLevels = levels.filter(l => levelLessons(l).length > 0 && getLevelProgress(stats, l) === 100).length;
  const current = levels.find(l => { const p = getLevelProgress(stats, l); return levelLessons(l).length > 0 && p < 100 && isLevelUnlocked(stats, l.id); });
  const next = getNextLesson(stats);

  const visible = useMemo(() => levels.filter(l =>
    (tab === 'all' || l.group === tab) &&
    (filter.trim() === '' || (l.title + l.description).toLowerCase().includes(filter.toLowerCase()))
  ), [tab, filter]);

  return (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,1fr)', gap: 24, alignItems: 'center' }} className="curr-head">
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Chip tone="success">● Active Track</Chip><span className="label-mono">/ FOUNDATIONS STAGE</span>
          </div>
          <h1 className="t-display" style={{ marginBottom: 12 }}>Curriculum Roadmap</h1>
          <p className="t-body-lg" style={{ maxWidth: 560 }}>Methodical, systems-first engineering roadmap from fundamental architecture up to distributed systems.</p>
        </div>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 24, justifyContent: 'space-between' }}>
          <div><div className="label-mono">OVERALL TRACK</div><div className="t-hmd" style={{ marginTop: 8 }}>{completedLevels} <span className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>/ 14 Levels</span></div></div>
          <div><div className="label-mono">COMPLETED</div><div className="t-hmd" style={{ marginTop: 8, color: 'var(--success)' }}>{overall}%</div></div>
          <div><div className="label-mono">EST. DURATION</div><div className="t-hmd" style={{ marginTop: 8 }}>{getTotalEstimatedHours()} <span className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Hours</span></div></div>
        </div>
      </section>

      <section style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-secondary' : 'btn-ghost'}`}
              style={tab === t.id ? { background: 'var(--overlay)', borderColor: 'var(--border-strong)' } : {}}
              onClick={() => setTab(t.id)} aria-pressed={tab === t.id}>{t.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: 220, flex: '0 1 260px' }}>
          <input className="input" placeholder="Filter syllabus…" value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter syllabus" />
          <span className="chip" style={{ position: 'absolute', right: 8, top: 10 }}>⌘F</span>
        </div>
      </section>

      {current && (
        <section className="card" style={{ borderColor: 'var(--primary)', boxShadow: '0 0 0 1px var(--primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center' }} className="curr-current">
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <Chip tone="primary">● CURRENT IN-PROGRESS</Chip>
                <span className="label-mono">LEVEL {String(current.id).padStart(2, '0')} · {current.group.toUpperCase()}</span>
              </div>
              <h2 className="t-hlg" style={{ marginBottom: 8 }}>{current.title}</h2>
              <p className="t-body clamp-2" style={{ maxWidth: 640 }}>{current.description}</p>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }} className="t-body-sm">
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="clock" size={14} /> {current.estimatedHours} Hours estimated</span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}><Icon name="check-circle" size={14} /> {levelLessons(current).filter(l => stats.completedLessons.includes(l.id)).length} of {levelLessons(current).length} Modules complete</span>
                <span style={{ color: 'var(--success)' }}>{getLevelProgress(stats, current)}% Done</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', textAlign: 'right' }}>
              {next && <><span className="t-caption" style={{ color: 'var(--fg-muted)' }}>Next milestone</span><span className="t-body" style={{ color: 'var(--fg-primary)', maxWidth: 220 }}>{next.title}</span></>}
              <Link className="btn btn-primary" to={next ? `/learn/lesson/${next.id}` : `/learn/level/${current.id}`}>Resume Study <Icon name="arrow-right" size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="grid-3">
        {visible.filter(l => l.id !== current?.id && l.id !== 13).map(l => {
          const unlocked = isLevelUnlocked(stats, l.id);
          const prog = getLevelProgress(stats, l);
          const upNext = !unlocked && l.id === (current ? current.id + 1 : 1) || (unlocked && prog === 0 && levelLessons(l).length > 0 && l.id !== current?.id);
          return (
            <div key={l.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: unlocked ? 1 : .6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="label-mono">LEVEL {String(l.id).padStart(2, '0')}</span>
                {unlocked ? (upNext && <Chip>UP NEXT</Chip>) : <span style={{ color: 'var(--fg-muted)' }}><Icon name="lock" size={14} /></span>}
              </div>
              <h3 className="t-hsm">{l.title}</h3>
              <p className="t-body-sm clamp-3" style={{ flex: 1 }}>{l.description}</p>
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between' }} className="t-caption">
                <span>{l.estimatedHours} Hours</span>
                <span style={{ color: unlocked ? 'var(--success)' : 'var(--fg-muted)' }}>{unlocked ? (prog === 100 ? 'Completed' : `${prog}%`) : `Requires Level ${l.id - 1}`}</span>
              </div>
              {unlocked && <Link className="btn btn-secondary btn-sm" to={`/learn/level/${l.id}`}>{levelLessons(l).length > 0 ? 'Open Workspace' : 'Preview Workspace'} <Icon name="chevron-right" size={14} /></Link>}
            </div>
          );
        })}
      </section>

      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 24, alignItems: 'center' }} className="curr-cap">
        <div>
          <div className="label-mono" style={{ marginBottom: 8 }}>CAPSTONE · LEVEL 13 · MASTERY GATE</div>
          <h2 className="t-hmd" style={{ marginBottom: 8 }}>Production Distributed Application Capstone</h2>
          <p className="t-body clamp-2" style={{ maxWidth: 640 }}>{levels[13].description}</p>
        </div>
        <Chip icon="lock">Unlocks upon completing Levels 0–12</Chip>
      </section>

      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 20, alignItems: 'center' }} className="curr-foot">
        <span className="chip" style={{ padding: 10 }}><Icon name="cpu" size={18} /></span>
        <div>
          <h3 className="t-hsm" style={{ marginBottom: 6 }}>Deterministic Mastery Engine</h3>
          <p className="t-body-sm clamp-2">Each level contains isolated Linux containers, real compiler test harnesses, and zero guesswork. Progression is unlocked solely through verified completion of prior modules.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setSpecOpen(true)}>Read Syllabus Spec</button>
          {current && <Link className="btn btn-primary" to={`/learn/level/${current.id}`}>Continue Level {String(current.id).padStart(2, '0')}</Link>}
        </div>
      </section>

      {specOpen && (
        <div className="dialog-scrim" onClick={() => setSpecOpen(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()} role="dialog" aria-label="Syllabus specification">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="label-mono">SYLLABUS SPEC // 14 LEVELS</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSpecOpen(false)} aria-label="Close"><Icon name="x" size={16} /></button>
            </div>
            <div style={{ padding: 12 }}>
              {levels.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="t-body" style={{ color: 'var(--fg-secondary)' }}><span className="mono" style={{ color: 'var(--fg-muted)' }}>L{String(l.id).padStart(2, '0')}</span> · {l.title}</span>
                  <span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>{l.estimatedHours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@media (max-width: 1023px){ .curr-head,.curr-current,.curr-cap{grid-template-columns:1fr !important;} .curr-foot{grid-template-columns:auto minmax(0,1fr) !important;} } @media (max-width: 767px){ .curr-foot{grid-template-columns:1fr !important;} }`}</style>
    </>
  );
}
