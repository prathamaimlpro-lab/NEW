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
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date === todayKey(now)) return 'TODAY';
  if (date === todayKey(yesterday)) return 'YESTERDAY';

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).toUpperCase();
}

export function ActivityTimeline({ limit = 12 }: { limit?: number }) {
  const { stats } = usePlayer();
  const events = useMemo(() => getTimeline(stats, limit), [stats, limit]);

  if (events.length === 0) {
    return (
      <EmptyNote>
        No activity yet. Completed lessons, solved problems and finished visualizations will appear here as an engineering activity log.
      </EmptyNote>
    );
  }

  const groups: { label: string; items: TimelineEvent[] }[] = [];

  for (const event of events) {
    const label = dayLabel(event.date);
    const existing = groups.find(group => group.label === label);

    if (existing) {
      existing.items.push(event);
    } else {
      groups.push({ label, items: [event] });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map(group => (
        <div key={group.label}>
          <div className="dsec" style={{ marginBottom: 6 }}>{group.label}</div>

          {group.items.map((event, index) => {
            const meta = KIND_META[event.kind] ?? { label: event.kind, color: 'var(--d-fg2)' };

            const content = (
              <>
                <span className="mono t-caption" style={{ color: 'var(--d-muted)', width: 44, flex: 'none' }}>
                  {event.time ?? '—'}
                </span>

                <span className="dtl-dot" style={{ background: meta.color }} aria-hidden="true" />

                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="t-caption" style={{ color: meta.color }}>{meta.label}</span>
                  <span
                    className="t-body-sm"
                    style={{
                      color: 'var(--d-fg)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.title}
                  </span>
                </span>
              </>
            );

            return event.to ? (
              <Link key={`${event.kind}-${event.title}-${index}`} className="dtl-row" to={event.to}>
                {content}
              </Link>
            ) : (
              <div key={`${event.kind}-${event.title}-${index}`} className="dtl-row">
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
