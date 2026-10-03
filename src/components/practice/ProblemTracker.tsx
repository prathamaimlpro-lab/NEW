import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { problems } from '../../data/problems';
import { usePlayer } from '../../store/PlayerContext';

type Status = 'all' | 'not-started' | 'in-progress' | 'solved' | 'mastered';
type Diff = 'all' | 'EASY' | 'MEDIUM' | 'HARD';

const STATUS_LABEL: Record<Exclude<Status, 'all'>, string> = {
  'not-started': 'Not started', 'in-progress': 'In progress', solved: 'Solved', mastered: 'Mastered',
};

export function ProblemTracker() {
  const { stats } = usePlayer();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [diff, setDiff] = useState<Diff>('all');
  const [status, setStatus] = useState<Status>('all');
  const [topic, setTopic] = useState('all');

  const topics = useMemo(() => [...new Set(problems.flatMap(p => (p.topics ?? []) as string[]))].sort(), []);

  const statusOf = (id: string): Exclude<Status, 'all'> => {
    const r = (stats.problems as any)[id];
    if (!r || !r.attempts) return 'not-started';
    if (r.mastered) return 'mastered';
    if (r.solved) return 'solved';
    return 'in-progress';
  };

  const filtered = problems.filter(p => {
    if (diff !== 'all' && p.difficulty !== diff) return false;
    if (status !== 'all' && statusOf(p.id) !== status) return false;
    if (topic !== 'all' && !(p.topics ?? []).includes(topic)) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      const desc = ((p as any).prompt ?? p.description ?? '') as string;
      const hay = [p.title, desc, (p.topics ?? []).join(' '), p.pattern ?? ''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const activeChips: { label: string; clear: () => void }[] = [];
  if (diff !== 'all') activeChips.push({ label: diff.charAt(0) + diff.slice(1).toLowerCase(), clear: () => setDiff('all') });
  if (status !== 'all') activeChips.push({ label: STATUS_LABEL[status as Exclude<Status, 'all'>], clear: () => setStatus('all') });
  if (topic !== 'all') activeChips.push({ label: topic, clear: () => setTopic('all') });

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="pt-head">
        <label className="pt-search">
          <span className="sr-only">Search problems</span>
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search problems" />
        </label>
        <button type="button" className="btn btn-secondary" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(v => !v)}>
          Filters{activeChips.length > 0 ? ` · ${activeChips.length}` : ''}
        </button>
      </div>

      {activeChips.length > 0 && (
        <div className="chip-row" aria-label="Active filters">
          {activeChips.map(c => (
            <button key={c.label} type="button" className="chip-btn" aria-pressed="true" onClick={c.clear}>
              {c.label} ✕
            </button>
          ))}
        </div>
      )}

      {open && (
        <>
          <button type="button" className="sheet-scrim" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="pt-filters" role="dialog" aria-label="Problem filters">
            <div className="pt-fgroup">
              <span className="ui-index">Difficulty</span>
              <div className="chip-row">
                {(['all', 'EASY', 'MEDIUM', 'HARD'] as Diff[]).map(d => (
                  <button key={d} type="button" className="chip-btn" aria-pressed={diff === d} onClick={() => setDiff(d)}>
                    {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-fgroup">
              <span className="ui-index">Status</span>
              <div className="chip-row">
                {(['all', 'not-started', 'in-progress', 'solved', 'mastered'] as Status[]).map(s => (
                  <button key={s} type="button" className="chip-btn" aria-pressed={status === s} onClick={() => setStatus(s)}>
                    {s === 'all' ? 'All' : STATUS_LABEL[s as Exclude<Status, 'all'>]}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-fgroup">
              <span className="ui-index">Topic</span>
              <select className="input" value={topic} onChange={e => setTopic(e.target.value)} aria-label="Filter by topic">
                <option value="all">All topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Done</button>
          </div>
        </>
      )}

      <div className="pt-list" role="list" aria-label="Problems">
        {filtered.length === 0 && <div className="dempty">No problems match your search or filters.</div>}
        {filtered.map(p => {
          const st = statusOf(p.id);
          const diffLabel = p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase();
          const topicLine = [p.pattern ?? '', ...(p.topics ?? [])].filter(Boolean).join(' · ');
          return (
            <Link key={p.id} role="listitem" className="pt-row" to={`/practice/problems/${p.id}`}>
              <span className="pt-main">
                <span className="pt-title">{p.title}</span>
                <span className="pt-topics">{topicLine}</span>
              </span>
              <span className="pt-badges">
                <span className={`chip ${p.difficulty === 'HARD' ? 'chip-error' : p.difficulty === 'MEDIUM' ? 'chip-warning' : 'chip-success'}`}>
                  {diffLabel}
                </span>
                <span className="chip">{STATUS_LABEL[st]}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
