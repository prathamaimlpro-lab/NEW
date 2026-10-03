import { useEffect, useState } from 'react';
import { storageService } from './storageService';

const KEY = 'pixel_coding_v1';
const CHANGE = 'pixel-coding-change';

export interface CodingRecord { solved: boolean; attempts: number; lastRun: string | null }
type CodingMap = Record<string, CodingRecord>;

const read = (): CodingMap => storageService.get<CodingMap>(KEY, {});
const write = (m: CodingMap) => {
  storageService.set(KEY, m);
  window.dispatchEvent(new CustomEvent(CHANGE));
};

export function getCodingRecord(id: string): CodingRecord {
  return read()[id] ?? { solved: false, attempts: 0, lastRun: null };
}

export function recordRun(id: string, solved: boolean) {
  const m = read();
  const r = m[id] ?? { solved: false, attempts: 0, lastRun: null };
  r.attempts += 1;
  r.lastRun = new Date().toISOString();
  r.solved = r.solved || solved;
  m[id] = r;
  write(m);
}

export function codingSolvedCount(): number {
  return Object.values(read()).filter(r => r.solved).length;
}

export function useCodingProgress() {
  const [, bump] = useState(0);
  useEffect(() => {
    const on = () => bump(n => n + 1);
    window.addEventListener(CHANGE, on);
    return () => window.removeEventListener(CHANGE, on);
  }, []);
  return { record: getCodingRecord, solvedCount: codingSolvedCount() };
}
