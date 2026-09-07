import { Icon } from '../../components/common/Icon';

interface Props {
  playing: boolean; done: boolean; speed: number; size: number;
  onPlay: () => void; onPause: () => void; onStep: () => void; onStepBack: () => void;
  onReset: () => void; onRandomize: () => void; onSpeed: (v: number) => void; onSize: (v: number) => void;
}

export function VizControls(p: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }} role="toolbar" aria-label="Visualization controls">
      {p.playing
        ? <button className="btn btn-primary" onClick={p.onPause}><Icon name="play" size={14} /> Pause</button>
        : <button className="btn btn-primary" onClick={p.onPlay}><Icon name="play" size={14} /> {p.done ? 'Replay' : 'Play'}</button>}
      <button className="btn btn-secondary" onClick={p.onStepBack}><Icon name="chevron-left" size={14} /> Back</button>
      <button className="btn btn-secondary" onClick={p.onStep}>Step <Icon name="chevron-right" size={14} /></button>
      <button className="btn btn-secondary" onClick={p.onReset}>Reset</button>
      <button className="btn btn-secondary" onClick={p.onRandomize}><Icon name="bolt" size={14} /> Randomize</button>
      <label className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}>Speed
        <select className="input" style={{ width: 76, height: 36 }} value={p.speed} onChange={e => p.onSpeed(Number(e.target.value))} aria-label="Playback speed">
          <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
        </select>
      </label>
      <label className="t-caption" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--fg-muted)' }}>Size
        <select className="input" style={{ width: 70, height: 36 }} value={p.size} onChange={e => p.onSize(Number(e.target.value))} aria-label="Array size">
          <option value={6}>6</option><option value={8}>8</option><option value={10}>10</option><option value={12}>12</option>
        </select>
      </label>
    </div>
  );
}
