import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { problems } from '../../data/problems';
import { usePlayer } from '../../store/PlayerContext';
import { Difficulty } from '../../types';
import { Icon } from '../common/Icon';
import { Chip, EmptyState } from '../common/ui';

type StatusFilter = 'ALL' | 'not-started' | 'attempted' | 'solved' | 'favourite' | 'review';

export function ProblemTracker() {
  const { stats } = usePlayer();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState<'ALL' | Difficulty>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [topic, setTopic] = useState('ALL');

  const topics = useMemo(() => [...new Set(problems.flatMap(p => p.topics))], []);
  const statusOf = (id: string): 'not-started' | 'attempted' | 'solved' => {
    const r = stats.problems[id];
    if (!r || r.attempts === 0) return 'not-started';
    return r.solved ? 'solved' : 'attempted';
  };

  const filtered = problems.filter(p => p.status === 'PUBLISHED').filter(p => {
    const st = statusOf(p.id); const rec = stats.problems[p.id];
    if (q && !(p.title + p.description).toLowerCase().includes(q.toLowerCase())) return false;
    if (diff !== 'ALL' && p.difficulty !== diff) return false;
    if (topic !== 'ALL' && !p.topics.includes(topic)) return false;
    if (status === 'favourite') return !!rec?.favourite;
    if (status === 'review') return !!rec?.review;
    if (status !== 'ALL' && status !== 'favourite' && status !== 'review' && st !== status) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ flex: '1 1 200px' }} placeholder="Search problems…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search problems" />
        <select className="input" style={{ width: 130 }} value={diff} onChange={e => setDiff(e.target.value as 'ALL' | Difficulty)} aria-label="Difficulty filter">
          <option value="ALL">Difficulty</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
        </select>
        <select className="input" style={{ width: 140 }} value={status} onChange={e => setStatus(e.target.value as StatusFilter)} aria-label="Status filter">
          <option value="ALL">Status</option><option value="not-started">Not Started</option><option value="attempted">Attempted</option><option value="solved">Solved</option><option value="favourite">Favourite</option><option value="review">Review</option>
        </select>
        <select className="input" style={{ width: 130 }} value={topic} onChange={e => setTopic(e.target.value)} aria-label="Topic filter">
          <option value="ALL">Topic</option>{topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="No problems match" message="Adjust the filters, or new problems will appear here as they are authored and published." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => {
            const st = statusOf(p.id); const rec = stats.problems[p.id];
            return (
              <Link key={p.id} to={`/practice/problems/${p.id}`} className="card card-interactive" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    <span style={{ color: rec?.favourite ? 'var(--warning)' : 'var(--fg-subtle)' }}><Icon name="award" size={16} /></span>
                    <span className="t-body" style={{ color: 'var(--fg-primary)', fontWeight: 500 }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Chip tone={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{p.difficulty}</Chip>
                    {st === 'solved' ? <Chip tone="success" icon="check">SOLVED</Chip> : st === 'attempted' ? <Chip tone="info">ATTEMPTED</Chip> : <Chip>NOT STARTED</Chip>}
                    {rec?.review && <Chip tone="warning">REVIEW</Chip>}
                    <Chip tone="primary">+{p.xp} XP</Chip>
                  </div>
                </div>
                <p className="t-body-sm clamp-2" style={{ marginTop: 8 }}>{p.description}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
