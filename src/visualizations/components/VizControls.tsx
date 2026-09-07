import { Icon } from '../../components/common/Icon';

export interface VizLegendItem { color: string; label: string; desc: string }

interface Props {
  playing: boolean; done: boolean; speed: number; size: number; calm: boolean; legend: VizLegendItem[];
  onPlay: () => void; onPause: () => void; onStep: () => void; onStepBack: () => void;
  onReset: () => void; onRandomize: () => void; onSpeed: (v: number) => void; onSize: (v: number) => void; onCalm: (v: boolean) => void;
}

export function VizControls(p: Props) {
  return (
    <div className="vizlab-panel">
      <div className="vizlab-section">
        <div className="label-mono">CONTROLS</div>
        {p.playing
          ? <button className="btn btn-primary" style={{ width: '100%' }} onClick={p.onPause}><Icon name="play" size={14} /> Pause</button>
          : <button className="btn btn-primary" style={{ width: '100%' }} onClick={p.onPlay}><Icon name="play" size={14} /> {p.done ? 'Replay' : 'Play'}</button>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-secondary" onClick={p.onStepBack}><Icon name="chevron-left" size={14} /> Back</button>
          <button className="btn btn-secondary" onClick={p.onStep}>Step <Icon name="chevron-right" size={14} /></button>
          <button className="btn btn-secondary" onClick={p.onReset}>Reset</button>
          <button className="btn btn-secondary" onClick={p.onRandomize}><Icon name="bolt" size={14} /> New</button>
        </div>
      </div>

      <div className="vizlab-section">
        <div className="label-mono">SETTINGS</div>
        <label className="t-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, color: 'var(--fg-muted)' }}>
          Array size
          <select className="input" style={{ width: 84, height: 36 }} value={p.size} onChange={e => p.onSize(Number(e.target.value))} aria-label="Array size">
            <option value={5}>5</option><option value={8}>8</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option>
          </select>
        </label>
        <label className="t-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, color: 'var(--fg-muted)' }}>
          Speed
          <select className="input" style={{ width: 84, height: 36 }} value={p.speed} onChange={e => p.onSpeed(Number(e.target.value))} aria-label="Animation speed">
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
          </select>
        </label>
        <label className="t-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, color: 'var(--fg-muted)' }}>
          Calm motion (no bar transitions)
          <input type="checkbox" checked={p.calm} onChange={e => p.onCalm(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
        </label>
      </div>

      <div className="vizlab-section">
        <div className="label-mono">LEGEND</div>
        {p.legend.map(l => (
          <div key={l.label} className="vizlab-legend-row">
            <span className="sw" style={{ background: l.color }} />
            <div><div className="t-caption" style={{ color: 'var(--fg-primary)' }}>{l.label}</div><div className="t-caption" style={{ color: 'var(--fg-muted)' }}>{l.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
