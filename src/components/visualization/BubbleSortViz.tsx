import { useEffect, useRef } from 'react';
import { bubbleSort } from '../../visualizations/algorithms/bubbleSort';
import { VizControls } from '../../visualizations/components/VizControls';
import { VizInspector } from '../../visualizations/components/VizInspector';
import { VizLearningPanel } from '../../visualizations/components/VizLearningPanel';
import { useArrayVisualization } from '../../visualizations/engine/useArrayVisualization';
import { BarArrayRenderer } from '../../visualizations/renderers/BarArrayRenderer';

export function BubbleSortViz({ onComplete }: { onComplete?: () => void }) {
  const viz = useArrayVisualization(bubbleSort, 8);
  const fired = useRef(false);

  useEffect(() => { fired.current = false; }, [viz.steps]);
  useEffect(() => {
    if (viz.current.kind === 'sorted' && viz.index > 0 && !fired.current) { fired.current = true; onComplete?.(); }
  }, [viz.current, viz.index, onComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <VizControls
        playing={viz.playing} done={viz.done} speed={viz.speed} size={viz.size}
        onPlay={viz.play} onPause={viz.pause} onStep={viz.stepForward} onStepBack={viz.stepBack}
        onReset={viz.reset} onRandomize={viz.randomize} onSpeed={viz.setSpeed} onSize={viz.changeSize}
      />
      <BarArrayRenderer step={viz.current} />
      <VizInspector step={viz.current} index={viz.index} total={viz.steps.length} />
      <VizLearningPanel algorithm={bubbleSort} step={viz.current} />
    </div>
  );
}
