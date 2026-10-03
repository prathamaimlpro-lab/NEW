import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessons as legacyLessons } from '../../data/lessons';
import { levels as legacyLevels } from '../../data/curriculum';
import { useDashboardData } from '../../dashboard/useDashboard';

type Sort = 'ranked' | 'mastery-asc' | 'gap' | 'world';
const tierOf = (m: number) => (m >= 85 ? 'Mastered' : m >= 60 ? 'Solid' : m >= 35 ? 'Learning' : 'Not started');

const topicWorld = (topic: string): number => {
  const lesson = Object.values(legacyLessons).find(l => (l.topics ?? []).includes(topic));
  const level = lesson ? legacyLevels.find(x => x.id === lesson.levelId) : undefined;
  return level ? level.number : 999;
};

export function MasteryAnalytics() {
  const d = useDashboardData();
  const [sort, setSort] = useState<Sort>('ranked');
  const zone = d.mastery;

  const rows = useMemo(() => {
    if (zone.status !== 'ready' || !zone.data) return [];
    const r = [...zone.data.rows];
    if (sort === 'mastery-asc') r.sort((a, b) => a.mastery - b.mastery);
    else if (sort === 'gap') r.sort((a, b) => b.gap - a.gap);
    else if (sort === 'world') r.sort((a, b) => topicWorld(a.topic) - topicWorld(b.topic));
    else r.sort((a, b) => b.mastery - a.mastery);
    return r.slice(0, 5);
  }, [zone, sort]);

  if (zone.status !== 'ready' || !zone.data) {
    return (
      <section className="d3-mastery" aria-label="Mastery analytics">
        <div className="d3-chart-head"><span className="d3-eyebrow">Mastery</span></div>
        <div className="dempty">Mastery appears once you have practice or lesson evidence for at least one topic.</div>
      </section>
    );
  }

  return (
    <section className="d3-mastery" aria-label="Mastery analytics by topic">
      <div className="d3-chart-head">
        <span className="d3-eyebrow">Mastery</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 150, height: 32 }} value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort mastery topics">
            <option value="ranked">Recently active</option>
            <option value="mastery-asc">Mastery ascending</option>
            <option value="gap">Largest gap</option>
            <option value="world">World order</option>
          </select>
          <Link className="d-micro" style={{ color: 'var(--action-text)' }} to="/progress">View full →</Link>
        </div>
      </div>

      <div className="d3-mrows">
        {rows.map(r => (
          <div key={r.topic} className="d3-mrow" role="group" aria-label={`${r.topic}: mastery ${r.mastery} percent, completion ${r.completion} percent, ${tierOf(r.mastery)}`}>
            <div className="d3-mrow-top">
              <span className="d3-mrow-topic">{r.topic}</span>
              <span className="chip">{tierOf(r.mastery)}</span>
              <span className="d3-mrow-val">{r.mastery}%</span>
            </div>
            <div className="d3-mrow-bars">
              <div className="d3-bar d3-bar-completion" title={`completion ${r.completion}%`}><div style={{ width: `${r.completion}%` }} /></div>
              <div className="d3-bar d3-bar-mastery" title={`mastery ${r.mastery}%`}><div style={{ width: `${r.mastery}%` }} /></div>
            </div>
            <div className="d3-mrow-foot">
              <span>completion {r.completion}%</span>
              <span className={r.gap > 0 ? 'd3-gap' : ''}>{r.gap > 0 ? `${r.gap} pts behind completion` : 'matches completion'}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="d3-mlegend">
        <span><span className="d3-bar d3-bar-completion" style={{ width: 18, display: 'inline-block' }} /> completion</span>
        <span><span className="d3-bar d3-bar-mastery" style={{ width: 18, display: 'inline-block' }} /> mastery</span>
      </div>
    </section>
  );
}
