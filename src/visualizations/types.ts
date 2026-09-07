export interface ArrayItem { id: number; value: number }

export type ArrayStepKind = 'initial' | 'compare' | 'swap' | 'no-swap' | 'pass-complete' | 'sorted';

export interface ArrayVizStep {
  kind: ArrayStepKind;
  items: ArrayItem[];
  active: [number, number] | null;
  pass: number;
  comparisons: number;
  swaps: number;
  sortedFrom: number;
  swappedNow: boolean;
  explanation: string;
  codeLine: number;
}

export interface AlgorithmComplexity { best: string; average: string; worst: string; space: string }

export interface ArrayAlgorithm {
  id: string;
  title: string;
  shortDescription: string;
  complexity: AlgorithmComplexity;
  complexityExplained: string;
  pseudocode: string[];
  generateSteps(items: ArrayItem[]): ArrayVizStep[];
}
