import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjectRows, getStrengthEvidence, getVisualizationRows, getWeaknessEvidence, relTime } from '../../services/dashboardService';
import { getTimeline } from '../../services/activityService';
import { usePlayer } from '../../store/PlayerContext';

export function StrengthWeakness() {
  const { stats } = usePlayer();
  const weak = useMemo(() => getWeaknessEvidence(stats), [stats]);
  const strong = useMemo(() => getStrengthEvidence(stats), [stats]);
  return (
    <section className="p-list" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {weak.length > 0 && (
        <div>
          <div className="d-eyebrow" style={{ color: 'var(--signal-weak)', marginBottom: 10 }}>⚠ Weakness detected</div>
          {weak.map(w => (
            <div key={w.topic} style={{ marginBottom: 14 }}>
              <div className="d-title" style={{ marginBottom: 6 }}>{w.topic}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                {w.lines.map(l => <li key={l} className="d-micro" style={{ color: 'var(--text-secondary)' }}>· {l}</li>)}
              </ul>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link className="cta-outline" to="/practice">Review concept</Link>
                <Link className="cta-solid" style={{ minHeight: 38, fontSize: 14 }} to="/practice">Practice {w.topic}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {weak.length === 0 && <p className="d-micro" style={{ color: 'var(--text-muted)' }}>No weak areas detected yet — keep practicing to build the signal.</p>}
      {strong.length > 0 && (
        <div>
          <div className="d-eyebrow" style={{ color: 'var(--signal-mastered)', marginBottom: 10 }}>✓ Strength identified</div>
          {strong.map(s => (
            <div key={s.topic} style={{ marginBottom: 12 }}>
              <div className="d-title" style={{ marginBottom: 6 }}>{s.topic}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {s.lines.map(l => <li key={l} className="d-micro" style={{ color: 'var(--text-secondary)' }}>· {l}</li>)}
              </ul>
              <Link className="d-micro" style={{ color: 'var(--text-muted)', display: 'inline-block', marginTop: 6 }} to="/practice">Practice more →</Link>
            </div>
          ))}
        </div>
      )}
      {strong.length === 0 && weak.length === 0 && (
        <div className="dempty">Not enough practice data yet. Complete lessons and solve problems to unlock insights.</div>
      )}
    </section>
  );
}

export function ProjectAnalytics() {
  const { stats } = usePlayer();
  const rows = useMemo(() => getProjectRows(stats), [stats]);
  return (
    <section className="p-list">
      <div className="p-head"><span className="d-title">Projects</span></div>
      {rows.length === 0 ? <div className="dempty">No projects published yet.</div> : rows.map(({ project, done, skills, levelNumber }) => (
        <Link key={project.id} className="lrow" style={{ alignItems: 'flex-start' }} to={levelNumber ? `/learn/level/level-${levelNumber}` : '/learn'}>
          <span className="rail"><span className="dot" style={{ background: done ? 'var(--signal-mastered)' : 'var(--text-subtle)' }} /></span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className="d-body" style={{ color: 'var(--text-primary)', display: 'block' }}>{project.title}</span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {skills.map(s => <span key={s} className="chip2">{s}</span>)}
              <span className="chip2">{project.difficulty}</span>
            </span>
            <span className="d-micro" style={{ display: 'block', marginTop: 6, color: 'var(--text-muted)' }}>Next: {project.requirements[0] ?? '—'}</span>
          </span>
          <span className="d-micro">{done ? 'done' : `+${project.xp} XP`}</span>
        </Link>
      ))}
    </section>
  );
}

function Thumb({ id }: { id: string }) {
  if (id === 'bubble-sort') {
    return (
      <svg width="148" height="40" aria-hidden="true">
        {[14, 26, 10, 32, 20, 24].map((h, i) => (
          <rect key={i} x={4 + i * 24} y={38 - h} width="16" height={h} rx="2" fill={i === 2 ? 'var(--signal-strong)' : 'var(--surface-3)'} />
        ))}
      </svg>
    );
  }
  return (
    <svg width="148" height="40" aria-hidden="true">
      {[6, 42, 78, 114].map((x, i) => (
        <g key={i}>
          <rect x={x} y={12} width="22" height="16" rx="3" fill={i === 2 ? 'var(--signal-strong)' : 'var(--surface-3)'} />
          {i < 3 && <line x1={x + 22} y1={20} x2={x + 36} y2={20} stroke="var(--border-strong)" strokeWidth="1.5" />}
        </g>
      ))}
    </svg>
  );
}

export function VisualizationActivity() {
  const { stats } = usePlayer();
  const rows = useMemo(() => getVisualizationRows(stats), [stats]);
  return (
    <section className="p-list">
      <div className="p-head">
        <span className="d-title">Visualization Activity</span>
        <Link className="d-micro" style={{ color: 'var(--signal-strong)' }} to="/explore">See all in Explore →</Link>
      </div>
      <div className="vizrow">
        {rows.map(r => (
          <Link key={r.viz.id} className="vizcard" to={`/explore/viz/${r.viz.id}`}>
            <Thumb id={r.viz.id} />
            <span className="d-body" style={{ color: 'var(--text-primary)' }}>{r.viz.title}</span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="chip2">{r.viz.category}</span>
              {r.completed && <span className="chip2" style={{ color: 'var(--signal-mastered)' }}>done</span>}
            </span>
            <span className="d-micro" style={{ color: 'var(--text-muted)' }}>{r.lastIso ? relTime(r.lastIso) : 'not used yet'}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const KIND_DOT: Record<string, string> = {
  lesson_completed: 'var(--signal-strong)',
  problem_solved: 'var(--signal-mastered)',
  visualization_completed: 'var(--signal-mastered)',
  project_completed: 'var(--text-secondary)',
  revision_completed: 'var(--signal-weak)',
};
const KIND_VERB: Record<string, string> = {
  lesson_completed: 'Completed lesson',
  problem_solved: 'Solved problem',
  visualization_completed: 'Completed visualization',
  project_completed: 'Completed project',
  revision_completed: 'Revised',
};

export function TimelineSection() {
  const { stats } = usePlayer();
  const [limit, setLimit] = useState(10);
  const events = useMemo(() => getTimeline(stats, 200), [stats]);
  const groups: { label: string; items: typeof events }[] = [];
  for (const e of events) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    const label = e.date === todayKeyStr(today) ? 'Today' : e.date === todayKeyStr(yest) ? 'Yesterday' : new Date(`${e.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const g = groups.find(x => x.label === label);
    if (g) g.items.push(e); else groups.push({ label, items: [e] });
  }
  let rendered = 0;
  return (
    <section className="p-list">
      <div className="p-head"><span className="d-title">Activity Timeline</span></div>
      {events.length === 0 ? <div className="dempty">No activity yet. Completed lessons, solved problems and finished visualizations will appear here.</div> : (
        <>
          {groups.map(g => {
            if (rendered >= limit) return null;
            return (
              <div key={g.label}>
                <div className="d-micro" style={{ color: 'var(--text-subtle)', margin: '10px 0 4px' }}>{g.label}</div>
                {g.items.map((e, i) => {
                  if (rendered >= limit) return null;
                  rendered += 1;
                  return (
                    <div key={`${e.kind}-${e.title}-${i}`} className="lrow">
                      <span className="rail"><span className="dot" style={{ background: KIND_DOT[e.kind] ?? 'var(--text-subtle)' }} /></span>
                      <span className="d-body" style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {KIND_VERB[e.kind] ?? e.kind}: {e.title}
                      </span>
                      <span className="d-micro">{e.time ?? relTime(e.at)}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {events.length > limit && (
            <button className="cta-outline" style={{ marginTop: 12, minHeight: 32 }} onClick={() => setLimit(l => l + 10)}>Load more</button>
          )}
        </>
      )}
    </section>
  );
}

function todayKeyStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
