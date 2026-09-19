import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { levels } from '../../data/curriculum';
import { problems } from '../../data/problems';
import { usePlayer } from '../../store/PlayerContext';
import type { Difficulty } from '../../types';

type StatusFilter = 'ALL' | 'not-started' | 'attempted' | 'solved' | 'review' | 'mastered' | 'favourite' | 'recent';

export function statusOf(stats: ReturnType<typeof usePlayer>['stats'], id: string): 'not-started' | 'attempted' | 'solved' | 'review' | 'mastered' {
  const r = stats.problems[id];
  if (!r || r.attempts === 0) return 'not-started';
  if (r.mastered) return 'mastered';
  if (r.review && r.solved) return 'review';
  return r.solved ? 'solved' : 'attempted';
}

const STATUS_CHIP: Record<ReturnType<typeof statusOf>, { label: string; cls: string }> = {
  'not-started': { label: 'Not Started', cls: 'chip' },
  attempted: { label: 'Attempted', cls: 'chip chip-info' },
  solved: { label: 'Solved', cls: 'chip chip-success' },
  review: { label: 'Needs Review', cls: 'chip chip-warning' },
  mastered: { label: 'Mastered', cls: 'chip chip-info' },
};

export function ProblemTracker() {
  const { stats } = usePlayer();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState<'ALL' | Difficulty>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [topic, setTopic] = useState('ALL');
  const [pattern, setPattern] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [open, setOpen] = useState(false);

  const topics = useMemo(() => [...new Set(problems.flatMap(p => p.topics))].sort(), []);
  const patterns = useMemo(() => [...new Set(problems.map(p => p.pattern))].sort(), []);
  const activeCount = [diff !== 'ALL', status !== 'ALL', topic !== 'ALL', pattern !== 'ALL', level !== 'ALL', q !== ''].filter(Boolean).length;

  const filtered = problems.filter(p => p.status === 'PUBLISHED').filter(p => {
    const st = statusOf(stats, p.id);
    const rec = stats.problems[p.id];
    if (q && !(p.title + p.description).toLowerCase().includes(q.toLowerCase())) return false;
    if (diff !== 'ALL' && p.difficulty !== diff) return false;
    if (topic !== 'ALL' && !p.topics.includes(topic)) return false;
    if (pattern !== 'ALL' && p.pattern !== pattern) return false;
    if (level !== 'ALL' && p.relatedLevel !== level) return false;
    if (status === 'favourite') return !!rec?.favourite;
    if (status === 'recent') return !!rec?.lastAttempted && (Date.now() - new Date(rec.lastAttempted).getTime()) < 7 * 86400000;
    if (status !== 'ALL' && st !== status) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="pfilters">
        <button type="button" className="btn btn-sm btn-ghost pfilters-toggle" onClick={() => setOpen(v => !v)} aria-expanded={open}>
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        <div className={`pfilters-row ${open ? 'open' : ''}`}>
          <input className="input" style={{ flex: '1 1 200px' }} placeholder="Search problems…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search problems" />
          <select className="input" style={{ width: 120 }} value={diff} onChange={e => setDiff(e.target.value as 'ALL' | Difficulty)} aria-label="Difficulty filter">
            <option value="ALL">Difficulty</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
          </select>
          <select className="input" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value as StatusFilter)} aria-label="Status filter">
            <option value="ALL">Status</option><option value="not-started">Not Started</option><option value="attempted">Attempted</option><option value="solved">Solved</option><option value="review">Needs Review</option><option value="mastered">Mastered</option><option value="favourite">Favourite</option><option value="recent">Recently Solved</option>
          </select>
          <select className="input" style={{ width: 130 }} value={topic} onChange={e => setTopic(e.target.value)} aria-label="Topic filter">
            <option value="ALL">Topic</option>{topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" style={{ width: 150 }} value={pattern} onChange={e => setPattern(e.target.value)} aria-label="Pattern filter">
            <option value="ALL">Pattern</option>{patterns.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input" style={{ width: 130 }} value={level} onChange={e => setLevel(e.target.value)} aria-label="Related level filter">
            <option value="ALL">Level</option>
            {levels.filter(l => problems.some(p => p.relatedLevel === l.id)).map(l => <option key={l.id} value={l.id}>Level {l.number}</option>)}
          </select>
        </div>
      </div>
      <style>{`
        .pfilters-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        @media (max-width: 767px) { .pfilters-row { display: none; } .pfilters-row.open { display: flex; } }
        @media (min-width: 768px) { .pfilters-toggle { display: none; } }
      `}</style>

      {filtered.length === 0 ? (
        <div className="dempty">No problems match the current filters. Clear a filter or search a different term.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => {
            const st = statusOf(stats, p.id);
            const rec = stats.problems[p.id];
            const chip = STATUS_CHIP[st];
            return (
              <Link key={p.id} to={`/practice/problems/${p.id}`} className="card card-interactive" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="d-body" style={{ color: 'var(--text-primary, #F8FAFC)', fontWeight: 500 }}>{p.title}</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`chip ${p.difficulty === 'EASY' ? 'chip-success' : p.difficulty === 'MEDIUM' ? 'chip-warning' : 'chip-error'}`}>{p.difficulty}</span>
                    <span className={chip.cls}>{chip.label}</span>
                    {rec?.favourite && <span className="chip">★ Favourite</span>}
                  </div>
                </div>
                <p className="d-body-sm" style={{ marginTop: 8, color: 'var(--text-secondary, #94A3B8)' }}>{p.description}</p>
                <div className="d-micro" style={{ marginTop: 8, color: 'var(--text-muted, #64748B)' }}>{p.pattern} · {p.topics.join(' · ')}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
