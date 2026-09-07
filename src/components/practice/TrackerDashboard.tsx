import { Link } from 'react-router-dom';
import { problems } from '../../data/problems';
import { getProblemTopicProgress, getCodingStats } from '../../services/statsService';
import { usePlayer } from '../../store/PlayerContext';
import { Icon } from '../common/Icon';
import { ActivityHeatmap, Chip, Progress } from '../common/ui';

export function TrackerDashboard() {
  const { stats } = usePlayer();
  const s = getCodingStats(stats);
  const topicProg = getProblemTopicProgress(stats);
  const review = problems.filter(p => stats.problems[p.id]?.review && stats.problems[p.id]?.solved);
  const favs = problems.filter(p => stats.problems[p.id]?.favourite);
  const recent = [...problems].filter(p => stats.problems[p.id]?.lastAttempted).sort((a, b) => (stats.problems[b.id]?.lastAttempted ?? '').localeCompare(stats.problems[a.id]?.lastAttempted ?? '')).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-4">
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>SOLVED</div><div className="t-hmd">{s.solved} / {problems.length}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>overall progress {problems.length ? Math.round((s.solved / problems.length) * 100) : 0}%</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>BY DIFFICULTY</div><div className="t-hmd">{s.easy} / {s.medium} / {s.hard}</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>easy · medium · hard</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>ACCEPTANCE</div><div className="t-hmd">{s.acceptance}%</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>{s.submissions} submissions</p></div>
        <div className="card"><div className="label-mono" style={{ marginBottom: 8 }}>STREAK</div><div className="t-hmd">{stats.streak} days</div><p className="t-caption" style={{ marginTop: 8, color: 'var(--fg-muted)' }}>best {stats.bestStreak}</p></div>
      </div>

      <div className="card">
        <div className="label-mono" style={{ marginBottom: 16 }}>SOLVING ACTIVITY // 16 WEEKS</div>
        <div style={{ overflowX: 'auto' }}><ActivityHeatmap activity={stats.activity} /></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>TOPIC PROGRESS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topicProg.map(t => (
              <div key={t.topic}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }} className="t-body-sm"><span style={{ color: 'var(--fg-secondary)' }}>{t.topic}</span><span className="mono" style={{ color: 'var(--fg-muted)' }}>{t.solved}/{t.total}</span></div>
                <Progress value={t.total ? (t.solved / t.total) * 100 : 0} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="label-mono" style={{ marginBottom: 16 }}>REVIEW QUEUE</div>
          {review.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>Nothing needs review. Mark solved problems for revision from their page.</p> : review.map(p => (
            <Link key={p.id} to={`/practice/problems/${p.id}`} className="t-body" style={{ display: 'flex', gap: 8, padding: '8px 0', color: 'var(--fg-secondary)' }}><Icon name="flag" size={14} /> {p.title}</Link>
          ))}
          <div className="label-mono" style={{ margin: '16px 0 8px' }}>FAVOURITES</div>
          {favs.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>No favourites yet.</p> : favs.map(p => (
            <Link key={p.id} to={`/practice/problems/${p.id}`} className="t-body" style={{ display: 'flex', gap: 8, padding: '8px 0', color: 'var(--fg-secondary)' }}><Icon name="award" size={14} /> {p.title}</Link>
          ))}
          <div className="label-mono" style={{ margin: '16px 0 8px' }}>RECENT</div>
          {recent.length === 0 ? <p className="t-body-sm" style={{ color: 'var(--fg-muted)' }}>No attempts yet.</p> : recent.map(p => (
            <Link key={p.id} to={`/practice/problems/${p.id}`} className="t-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', color: 'var(--fg-secondary)' }}>
              <span>{p.title}</span><span className="mono t-caption" style={{ color: 'var(--fg-muted)' }}>{stats.problems[p.id]?.lastAttempted}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}><Chip tone="primary">RATING {s.rating}</Chip><Chip tone="info">CODING XP {s.codingXp}</Chip></div>
    </div>
  );
}
