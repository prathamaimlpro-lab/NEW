import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRankedAction } from '../../services/dashboardService';
import { usePlayer } from '../../store/PlayerContext';

export function NextBestAction() {
  const { stats } = usePlayer();
  const action = useMemo(() => getRankedAction(stats), [stats]);
  return (
    <section className="p-rec" style={{ ['--rec-accent' as string]: action.accent === 'weak' ? 'var(--signal-weak)' : 'var(--signal-strong)' }}>
      <div className="d-eyebrow" style={{ marginBottom: 10 }}>Next Best Action</div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        {action.headline}
      </p>
      <p className="d-body" style={{ marginBottom: 16 }}>{action.why}</p>
      <Link className="cta-outline" to={action.to}>{action.headline}</Link>
    </section>
  );
}
