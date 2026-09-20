import type { ContractSpec } from './types';

/* Dashboard 3.0 §29 minimum-sample thresholds. Respected exactly by selectors. */
export const CONTRACTS = {
  practiceMatrix: { minAttempts: 10 },
  practiceTrend: { minAttempts: 3 },
  weakness: { minAttemptsPerTopic: 5 },
  strength: { minAttemptsPerTopic: 5 },
  velocity: { minWeeks: 2 },
  revisionRisk: { minCompletedCycles: 1 },
  mastery: { minActivity: 1 },
  structural: { minActivity: 0 },
} as const;

export const CONTRACT_SPECS: ContractSpec[] = [
  { key: 'practiceMatrix', minSample: 10, unit: 'total attempts', fallback: 'insufficient', refresh: 'on-stats-change', note: 'Accuracy-by-difficulty matrix hidden below 10 attempts.' },
  { key: 'practiceTrend', minSample: 3, unit: 'solved problems', fallback: 'insufficient', refresh: 'on-stats-change', note: '7-day solved sparkline needs ≥3 solves.' },
  { key: 'weakness', minSample: 5, unit: 'attempts per topic', fallback: 'insufficient', refresh: 'on-stats-change', note: 'Weakness intelligence needs ≥5 attempts/topic.' },
  { key: 'strength', minSample: 5, unit: 'attempts per topic', fallback: 'insufficient', refresh: 'on-stats-change', note: 'Strength intelligence needs ≥5 attempts/topic.' },
  { key: 'velocity', minSample: 2, unit: 'weeks of history', fallback: 'insufficient', refresh: 'on-stats-change', note: 'Learning velocity needs ≥2 weeks since first activity.' },
  { key: 'revisionRisk', minSample: 1, unit: 'completed revision cycle', fallback: 'empty', refresh: 'on-stats-change', note: 'Revision risk needs ≥1 due/completed cycle.' },
  { key: 'mastery', minSample: 1, unit: 'topic with activity', fallback: 'empty', refresh: 'on-stats-change', note: 'Mastery analytics need ≥1 active topic; completion reported separately.' },
  { key: 'structural', minSample: 0, unit: 'learner events', fallback: 'empty', refresh: 'on-content-change', note: 'Knowledge graph / curriculum journey are structural and valid at zero activity.' },
];
