import { useEffect, useRef, useState } from 'react';
import { bubbleSort } from '../../visualizations/algorithms/bubbleSort';
import { VizControls, VizLegendItem } from '../../visualizations/components/VizControls';
import { VizInspector } from '../../visualizations/components/VizInspector';
import { VizLearningPanel } from '../../visualizations/components/VizLearningPanel';
import { useArrayVisualization } from '../../visualizations/engine/useArrayVisualization';
import { BarArrayRenderer } from '../../visualizations/renderers/BarArrayRenderer';
import { Icon } from '../common/Icon';
import { Chip } from '../common/ui';
import '../../styles/vizlab.css';

const LEGEND: VizLegendItem[] = [
  { color: 'var(--warning)', label: 'COMPARING (A & B)', desc: 'The two neighbours being examined right now.' },
  { color: 'var(--error)', label: 'SWAPPING', desc: 'Out of order — the two values exchange places.' },
  { color: 'var(--success)', label: 'SORTED (✓)', desc: 'Locked in its final position by a completed pass.' },
  { color: 'var(--primary)', label: 'UNSORTED', desc: 'Not yet finalized — still part of the working region.' },
];

const LIVE: Record<string, { label: string; tone: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  initial: { label: 'READY', tone: 'default' },
  compare: { label: 'COMPARING', tone: 'warning' },
  swap: { label: 'SWAPPING', tone: 'error' },
  'no-swap': { label: 'NO SWAP', tone: 'success' },
  'pass-complete': { label: 'PASS COMPLETE', tone: 'primary' },
  sorted: { label: 'SORTED', tone: 'success' },
};

export function BubbleSortViz({ onComplete }: { onComplete?: () => void }) {
  const viz = useArrayVisualization(bubbleSort, 8);
  const [calm, setCalm] = useState(false);
  const [focus, setFocus] = useState(false);
  const fired = useRef(false);

  useEffect(() => { fired.current = false; }, [viz.steps]);
  useEffect(() => {
    if (viz.current.kind === 'sorted' && viz.index > 0 && !fired.current) { fired.current = true; onComplete?.(); }
  }, [viz.current, viz.index, onComplete]);
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocus(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  const live = LIVE[viz.current.kind];

  return (
    <div className={`vizlab-root ${focus ? 'vizlab-focus' : ''}`}>
      <div className="vizlab-head">
        <span className="label-mono">VISUALIZATION LAB // {bubbleSort.title.toUpperCase()}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setFocus(v => !v)} aria-pressed={focus}>
          <Icon name="explore" size={14} /> {focus ? 'Exit Focus (Esc)' : 'Focus Mode'}
        </button>
      </div>

      <div className="vizlab">
        <div className="vizlab-controls">
          <VizControls
            playing={viz.playing} done={viz.done} speed={viz.speed} size={viz.size} calm={calm} legend={LEGEND}
            onPlay={viz.play} onPause={viz.pause} onStep={viz.stepForward} onStepBack={viz.stepBack}
            onReset={viz.reset} onRandomize={viz.randomize} onSpeed={viz.setSpeed} onSize={viz.changeSize} onCalm={setCalm}
          />
        </div>

        <div className="vizlab-canvas-wrap">
          <BarArrayRenderer step={viz.current} calm={calm} />
          <div className="vizlab-live" aria-live="polite">
            <Chip tone={live.tone}>{live.label}</Chip>
            <p className="t-body" style={{ color: 'var(--fg-secondary)' }}>{viz.current.explanation}</p>
          </div>
        </div>

        <div className="vizlab-inspector">
          <VizInspector step={viz.current} index={viz.index} total={viz.steps.length} />
        </div>
      </div>

      <VizLearningPanel algorithm={bubbleSort} step={viz.current} />
    </div>
  );
}
