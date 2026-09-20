import { useMemo } from 'react';
import { selectAnalyticsBandUnits } from '../../dashboard/bandSelectors';
import { usePlayer } from '../../store/PlayerContext';
import { Sparkline } from './Sparkline';

export function AnalyticsBand() {
  const { stats } = usePlayer();
  const units = useMemo(() => selectAnalyticsBandUnits(stats), [stats]);
  return (
    <section className="d3-band" aria-label="Key learning metrics">
      {units.map(u => (
        <div key={u.key} className="d3-band-unit">
          <div className="d3-eyebrow">{u.label}</div>
          <div className="d3-band-value">{u.value}</div>
          {u.status === 'ready' ? (
            <>
              {u.comparison && <div className="d3-band-cmp">{u.comparison}</div>}
              <Sparkline values={u.series} label={`${u.label}: ${u.seriesLabel}`} />
              <div className="d3-band-series">{u.seriesLabel}</div>
            </>
          ) : (
            <div className="d3-band-note">{u.reason}</div>
          )}
        </div>
      ))}
    </section>
  );
}
