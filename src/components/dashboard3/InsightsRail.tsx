import { Link } from 'react-router-dom';
import { selectRevisionItems, selectStrengthItems, selectWeaknessItems } from '../../dashboard/intelligenceSelectors';
import { usePlayer } from '../../store/PlayerContext';

interface Row { tone: 'ok' | 'warn' | 'danger'; title: string; why: string; to: string }

export function InsightsRail() {
  const { stats } = usePlayer();
  const weak = selectWeaknessItems(stats);
  const strong = selectStrengthItems(stats);
  const rev = selectRevisionItems(stats);

  const rows: Row[] = [
    ...(weak.status === 'ready' && weak.data ? weak.data.slice(0, 2).map(w => ({ tone: 'danger' as const, title: w.title, why: w.why, to: '/practice' })) : []),
    ...(rev.status === 'ready' && rev.data ? rev.data.slice(0, 2).map(r => ({ tone: 'warn' as const, title: r.title, why: r.statusLabel === 'due' ? `due · ${r.daysSince}d since review` : 'approaching revision window', to: r.actions[0]?.to ?? '/practice' })) : []),
    ...(strong.status === 'ready' && strong.data ? strong.data.slice(0, 2).map(s => ({ tone: 'ok' as const, title: s.title, why: s.why, to: '/practice' })) : []),
  ];

  return (
    <section className="ui-panel" aria-label="Learning insights">
      <div className="ui-panel-head"><div className="ui-index">Learning Insights</div><span className="ui-prov ui-prov-derived">derived</span></div>
      {rows.length === 0 ? (
        <div className="dempty">No evidence-backed insights yet. They appear once you have practice or revision history.</div>
      ) : rows.map((r, i) => (
        <Link key={`${r.title}-${i}`} className="v3-insight" to={r.to}>
          <span className="ui-dot" style={{ background: r.tone === 'ok' ? 'var(--success)' : r.tone === 'warn' ? 'var(--warning)' : 'var(--danger)' }} aria-hidden="true" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="v3-insight-title">{r.title}</span>
            <span className="ui-mono ui-muted" style={{ display: 'block' }}>{r.why}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
