import { useMemo } from 'react';
import { selectAnalyticsBandUnits } from '../../dashboard/bandSelectors';
import { usePlayer } from '../../store/PlayerContext';
import { KpiValue, type Provenance } from '../ui/primitives';
import { Sparkline } from './Sparkline';

const PROV: Record<string, Provenance> = { velocity: 'derived', mastery: 'derived', consistency: 'derived', accuracy: 'derived', revision: 'observed' };
const DELTA_FROM_SERIES: Record<string, boolean> = { velocity: true, consistency: true };

export function VitalsBand() {
  const { stats } = usePlayer();
  const units = useMemo(() => selectAnalyticsBandUnits(stats), [stats]);
  return (
    <div className="d3-band" role="group" aria-label="Key learning vitals">
      {units.map(u => {
        const s = u.series;
        const delta = DELTA_FROM_SERIES[u.key] && s.length >= 2 ? s[s.length - 1] - s[s.length - 2] : undefined;
        return (
          <div key={u.key} className="d3-band-unit">
            <KpiValue label={u.label} value={u.value} delta={delta} provenance={u.status === 'ready' ? PROV[u.key] : undefined}>
              {u.status === 'ready' ? (
                <>
                  {u.comparison && <div className="ui-mono ui-muted">{u.comparison}</div>}
                  {s.length > 0 && <Sparkline values={s} label={`${u.label}: ${u.seriesLabel}`} />}
                  <div className="ui-mono ui-muted">{u.seriesLabel}</div>
                </>
              ) : (
                <div className="ui-mono ui-muted">{u.reason}</div>
              )}
            </KpiValue>
          </div>
        );
      })}
    </div>
  );
}
