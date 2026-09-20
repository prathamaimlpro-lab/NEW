import { Link } from 'react-router-dom';
import { selectRevisionItems, selectStrengthItems, selectWeaknessItems, type IntelligenceItem } from '../../dashboard/intelligenceSelectors';
import { usePlayer } from '../../store/PlayerContext';

function EvidenceRow({ item }: { item: IntelligenceItem }) {
  return (
    <div className="d6-row">
      <div className="d6-row-top">
        <span className="d6-title">{item.title}</span>
        <span className="d6-ev">{item.attempts} attempts</span>
      </div>
      <div className="d6-ev">
        accuracy {item.accuracy === null ? '—' : `${item.accuracy}%`} · mastery {item.mastery === null ? '—' : `${item.mastery}%`}
        {item.lastDays !== null ? ` · last practiced ${item.lastDays}d ago` : ''}
      </div>
      <p className="d6-why">Why: {item.why}</p>
      <div className="d6-actions">
        {item.actions.map(a => <Link key={a.to + a.label} className="btn btn-sm btn-secondary" to={a.to}>{a.label}</Link>)}
      </div>
    </div>
  );
}

function ZoneState({ zone, emptyText }: { zone: { status: string; reason?: string }; emptyText: string }) {
  if (zone.status === 'insufficient') return <div className="d6-note">{zone.reason}</div>;
  if (zone.status === 'empty') return <div className="d6-note">{emptyText}</div>;
  return null;
}

export function IntelligenceArea() {
  const { stats } = usePlayer();
  const weak = selectWeaknessItems(stats);
  const strong = selectStrengthItems(stats);
  const revision = selectRevisionItems(stats);

  return (
    <section className="d6-area" aria-label="Learning intelligence">
      <div className="d6-col" aria-label="Weakness intelligence">
        <div className="d3-eyebrow d6-head">Needs attention</div>
        {weak.status === 'ready' && weak.data ? weak.data.map(i => <EvidenceRow key={i.id} item={i} />)
          : <ZoneState zone={weak} emptyText="No weak areas detected yet." />}
      </div>

      <div className="d6-col" aria-label="Strength intelligence">
        <div className="d3-eyebrow d6-head">Working well</div>
        {strong.status === 'ready' && strong.data ? strong.data.map(i => <EvidenceRow key={i.id} item={i} />)
          : <ZoneState zone={strong} emptyText="No strength areas meet the evidence threshold yet." />}
      </div>

      <div className="d6-col" aria-label="Revision intelligence">
        <div className="d3-eyebrow d6-head">Revision</div>
        {revision.status === 'ready' && revision.data ? revision.data.map(r => (
          <div key={r.id} className="d6-row">
            <div className="d6-row-top">
              <span className="d6-title">{r.title}</span>
              <span className="d6-ev">{r.statusLabel === 'due' ? 'due' : r.statusLabel === 'approaching' ? 'approaching' : 'cycle complete'}</span>
            </div>
            <div className="d6-ev">
              {r.daysSince > 0 ? `${r.daysSince} days since ${r.statusLabel === 'completed-cycle' ? 'last review' : 'completion'}` : 'scheduled from practice evidence'}
              {r.retentionRisk && <span className="d6-risk"> · ESTIMATED retention risk: {r.retentionRisk}</span>}
            </div>
            <div className="d6-actions">
              {r.actions.map(a => <Link key={a.to + a.label} className="btn btn-sm btn-secondary" to={a.to}>{a.label}</Link>)}
            </div>
          </div>
        )) : <ZoneState zone={revision} emptyText="Nothing is due for revision yet." />}
      </div>
    </section>
  );
}
