import { ComponentType } from 'react';
import { ComplexityInfo, Difficulty, VizCategory } from '../../types';
import { EmptyState } from '../common/ui';
import { BubbleSortViz } from './BubbleSortViz';
import { ComputerProcessingViz } from './ComputerProcessingViz';

export interface VisualizationDefinition {
  id: string; title: string; category: VizCategory; topic: string; description: string;
  difficulty: Difficulty; controls: string[]; complexity?: ComplexityInfo;
  legend?: { color: string; label: string }[]; xpReward: number;
  Component: ComponentType<{ onComplete?: () => void }>;
}

const registry = new Map<string, VisualizationDefinition>();
export function registerVisualization(def: VisualizationDefinition) { registry.set(def.id, def); }
export function getVisualization(id: string) { return registry.get(id); }
export function listVisualizations() { return [...registry.values()]; }

export function VisualizationRenderer({ id, onCompleted }: { id: string; onCompleted?: (id: string, xp: number) => void }) {
  const def = registry.get(id);
  if (!def) return <EmptyState icon="explore" title="Visualization unavailable" message="This visualization is not registered yet. New visualizations register here without engine changes." />;
  return <def.Component onComplete={onCompleted ? () => onCompleted(def.id, def.xpReward) : undefined} />;
}

registerVisualization({ id: 'computer-processing', title: 'How a Computer Processes a Task', category: 'CPU', topic: 'Computer Workflow', description: 'Follow a user action through OS, storage, RAM, CPU and output.', difficulty: 'EASY', controls: ['Prev', 'Next', 'Autoplay'], xpReward: 10, Component: ComputerProcessingViz });
registerVisualization({ id: 'bubble-sort', title: 'Bubble Sort', category: 'Algorithm', topic: 'Sorting', description: 'Watch adjacent comparisons and swaps move values into order, step by step.', difficulty: 'MEDIUM', controls: ['Play', 'Pause', 'Step', 'Reset', 'Randomize', 'Speed', 'Direction'], complexity: { time: 'O(n²)', space: 'O(1)' }, legend: [{ color: 'var(--primary)', label: 'Unsorted' }, { color: 'var(--warning)', label: 'Comparing' }, { color: 'var(--error)', label: 'Swapping' }, { color: 'var(--success)', label: 'Sorted' }], xpReward: 15, Component: BubbleSortViz });
