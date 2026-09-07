import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrayAlgorithm, ArrayItem, ArrayVizStep } from '../types';

let nextId = 1;
export function randomItems(size: number): ArrayItem[] {
  return Array.from({ length: size }, () => ({ id: nextId++, value: 10 + Math.floor(Math.random() * 90) }));
}

export function useArrayVisualization(algorithm: ArrayAlgorithm, initialSize = 8) {
  const [size, setSize] = useState(initialSize);
  const [items, setItems] = useState<ArrayItem[]>(() => randomItems(initialSize));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo<ArrayVizStep[]>(() => algorithm.generateSteps(items), [algorithm, items]);
  const current = steps[Math.min(index, steps.length - 1)];
  const done = index >= steps.length - 1;

  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const acc = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const interval = 900 / speed;
    const tick = (t: number) => {
      if (!last.current) last.current = t;
      acc.current += t - last.current;
      last.current = t;
      if (acc.current >= interval) {
        acc.current = 0;
        setIndex(i => Math.min(steps.length - 1, i + 1));
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); last.current = 0; acc.current = 0; };
  }, [playing, speed, steps.length]);

  useEffect(() => { if (done && playing) setPlaying(false); }, [done, playing]);

  const play = useCallback(() => { if (index >= steps.length - 1) setIndex(0); setPlaying(true); }, [index, steps.length]);
  const pause = useCallback(() => setPlaying(false), []);
  const stepForward = useCallback(() => { setPlaying(false); setIndex(i => Math.min(steps.length - 1, i + 1)); }, [steps.length]);
  const stepBack = useCallback(() => { setPlaying(false); setIndex(i => Math.max(0, i - 1)); }, []);
  const reset = useCallback(() => { setPlaying(false); setIndex(0); }, []);
  const randomize = useCallback(() => { setPlaying(false); setItems(randomItems(size)); setIndex(0); }, [size]);
  const changeSize = useCallback((s: number) => { setPlaying(false); setSize(s); setItems(randomItems(s)); setIndex(0); }, []);

  return { steps, current, index, done, playing, speed, size, setSpeed, play, pause, stepForward, stepBack, reset, randomize, changeSize };
}
