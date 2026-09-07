import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { problems } from '../../data/problems';
import { levels } from '../../data/curriculum';
import { todayKey } from '../../services/xpService';
import { usePlayer } from '../../store/PlayerContext';
import { Difficulty } from '../../types';
import { Icon } from '../common/Icon';
import { Chip, EmptyState } from '../common/ui';

type StatusFilter = 'ALL' | 'not-started' | 'attempted' | 'solved' | 'review' | 'mastered' | 'favourite' | 'recent';

export function statusOf(stats: ReturnType<typeof usePlayer>['stats'], id: string): 'not-started' | 'attempted' | 'solved' | 'review' | 'mastered' {
  const r = stats.problems[id];
  if (!r || r.attempts === 0) return 'not-started';
  if (r.mastered) return 'mastered';
  if (r.review && r.solved) return 'review';
  return r.solved ? 'solved' : 'attempted';
}

export function ProblemTracker() {
  const { stats } = usePlayer();
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState<'ALL' | Difficulty>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [topic, setTopic] = useState('ALL');
  const [pattern, setPattern] = useState('ALL');
  const [level, setLevel] = useState('ALL');

  const topics = useMemo(() => [...new Set(problems.flatMap(p => p.topics))].sort(), []);
  const patterns = useMemo(() => [...new Set(problems.map(p => p.pattern))].sort(), []);

  const filtered = problems.filter(p => p.status === 'PUBLISHED').filter(p => {
    const st = statusOf(stats, p.id); const rec = stats.problems[p.id];
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

  const sel = 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className={sel} style={{ flex: '1 1 200px' }} placeholder="Search problems…" value={q} onChange={e => setQ(e.target.value)} aria-label="Search problems" />
        <select className={sel} style={{ width: 120 }} value={diff} onChange={e => setDiff(e.target.value as 'ALL' | Difficulty)} aria-label="Difficulty"><option value="ALL">Difficulty</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select>
        <select className={sel} style={{ width: 140 }} value={status} onChange={e => setStatus(e.target.value as StatusFilter)} aria-label="Status"><option value="ALL">Status</option><option value="not-started">Not Started</option><option value="attempted">Attempted</option><option value="solved">Solved</option><option value="review">Needs Review</option><option value="mastered">Mastered</option><option value="favourite">Favourite</option><option value="recent">Recently Solved</option></select>
        <select className={sel} style={{ width: 130 }} value={topic} onChange={e => setTopic(e.target.value)} aria-label="Topic"><option value="ALL">Topic</option>{topics.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className={sel} style={{ width: 150 }} value={pattern} onChange={e => setPattern(e.target.value)} aria-label="Pattern"><option value="ALL">Pattern</option>{patterns.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className={sel} style={{ width: 130 }} value={level} onChange={e => setLevel(e.target.value)} aria-label="Related level"><option value="ALL">Level</option>{levels.filter(l => problems.some(p => p.relatedLevel === l.id)).map(l => <option key={l.id} value={l.id}>Level {l.number}</option>)}</select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="search" title="No problems match" message="Adjust the filters, or new problems will appear here as they are authored and published." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => {
            const st = statusOf(stats, p.id); const rec = stats.problems[p.id];
            return (
              <Link key={p.id} to={`/practice/problems/${p.id}`} className="card card-interactive" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    <span style={{ color: rec?.favourite ? 'var(--warning)' : 'var(--fg-subtle)' }}><Icon name="award" size={16} /></span>
                    <span className="t-body" style={{ color: 'var(--fg-primary)', fontWeight: 500 }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Chip tone={p.difficulty === 'EASY' ? 'success' : p.difficulty === 'MEDIUM' ? 'warning' : 'error'}>{p.difficulty}</Chip>
                    {st === 'mastered' ? <Chip tone="primary" icon="award">MASTERED</Chip> : st === 'review' ? <Chip tone="warning">NEEDS REVIEW</Chip> : st === 'solved' ? <Chip tone="success" icon="check">SOLVED</Chip> : st === 'attempted' ? <Chip tone="info">ATTEMPTED</Chip> : <Chip>NOT STARTED</Chip>}
                    <Chip tone="primary">+{p.xp} XP</Chip>
                  </div>
                </div>
                <p className="t-body-sm clamp-2" style={{ marginTop: 8 }}>{p.description}</p>
                <div className="t-caption mono" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{p.pattern} · {p.topics.join(' · ')}</div>
              </Link>
            );
          })}
        </div>
      )}
      <span className="t-caption" style={{ color: 'var(--fg-subtle)' }}>{todayKey()}</span>
    </div>
  );
}
