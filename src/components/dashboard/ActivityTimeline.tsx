import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTimeline, TimelineEvent } from '../../services/activityService';
import { todayKey } from '../../services/xpService';
import { usePlayer } from '../../store/PlayerContext';
import { EmptyNote } from './blocks';

const KIND_META: Record<string, { label: string; color: string }> = {
  lesson_completed: { label: 'Lesson', color: 'var(--d-green)' },
  problem_solved: { label: 'Solved', color: 'var(--d-blue)' },
  visualization_completed: { label: 'Visualization', color: 'var(--d-orange)' },
  project_completed: { label: 'Project', color: 'var(--d-indigo)' },
  revision_completed: { label: 'Revision', color: 'var(--d-orange)' },
};

function dayLabel(date: string): string {
  const now = new Date();
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (date === todayKey(now)) return 'TODAY';
  if (date === todayKey(y)) return 'YESTERDAY';
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

export function ActivityTimeline({ limit = 12 }: { limit?: number }) {
  const { stats } = usePlayer();
  const events = useMemo(() => getTimeline(stats, limit), [stats, limit]);
  if (events.length === 0) {
    return <EmptyNote>No activity yet. Completed lessons, solved problems and finished visualizations will appear here as an engineering activity log.</EmptyNote>;
  }
  const groups: { label: string; items: TimelineEvent[] }[] = [];
  for (const e of events) {
    const label = dayLabel(e.date);
    const g = groups.find(x => x.label === label);
    if (g) g.items.push(e); else groups.push({ label, items: [e] });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map(g => (
        <div key={g.label}>
          <div className="dsec" style={{ marginBottom: 6 }}>{g.label}</div>
          {g.items.map((e, i) => {
            const meta = KIND_META[e.kind] ?? { label: e.kind, color: 'var(--d-fg2)' };
            const inner = (
              <>
                <span className="mono t-caption" style={{ color: 'var(--d-muted)', width: 44, flex: 'none' }}>{e.time ?? '—'}</span>
                <span className="dtl-dot" style={{ background: meta.color }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="t-caption" style={{ color: meta.color }}>{meta.label}</span>
                  <span className="t-body-sm" style={{ color: 'var(--d-fg)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                </span>
              </>
            );
            return e.to ? <Link key={i} className="dtl-row" to={e.to}>{inner}</Link> : <div key={i} className="dtl-row">{inner}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
