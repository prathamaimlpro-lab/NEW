export type ZoneStatus = 'ready' | 'empty' | 'insufficient' | 'hidden';

export interface ZoneResult<T> {
  status: ZoneStatus;
  data: T | null;
  sampleSize: number;
  threshold: number;
  reason?: string;
}

export type LearnerStage = 'day0' | 'early' | 'developing' | 'advanced';

export interface ContractSpec {
  key: string;
  minSample: number;
  unit: string;
  fallback: ZoneStatus;
  refresh: 'on-stats-change' | 'on-content-change';
  note: string;
}
