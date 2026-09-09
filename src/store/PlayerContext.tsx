import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { achievementsData } from '../data/achievements';
import { lessons } from '../data/lessons';
import { projects } from '../data/projects';
import { evaluateAchievement } from '../services/achievementService';
import { loadRemoteProgress, saveRemoteProgress } from '../services/progressRepository';
import { storageService } from '../services/storageService';
import { calculatePlayerLevel, computeStreak, todayKey } from '../services/xpService';
import { ActivityEvent, DayActivity, PlayerStats, Problem, ProblemRecord, Question } from '../types';

const KEY = 'it_quest_player_v2';
const UPDATED_KEY = 'it_quest_player_v2_updated';
const emptyDay = (): DayActivity => ({ minutes: 0, problemsSolved: 0, submissions: 0, xpEarned: 0, count: 0 });
const emptyRecord = (): ProblemRecord => ({ attempts: 0, solved: false, solvedDate: null, favourite: false, review: false, mastered: false, confidence: 0, notes: '', scratchCode: '', timeSpent: 0, lastAttempted: null });

const defaults: PlayerStats = {
  xp: 0, level: 1, streak: 0, bestStreak: 0,
  completedLessons: [], completedQuestions: [], unlockedAchievements: [], visitedLessons: [],
  lessonCompletedAt: {}, completedProjects: [], practice: {}, problems: {}, completedVisualizations: [],
  activity: {}, events: [], firstActiveDate: null,
};

function migrate(raw: Partial<PlayerStats>): PlayerStats {
  const base: PlayerStats = { ...defaults, ...raw, lessonCompletedAt: raw.lessonCompletedAt ?? {}, completedProjects: raw.completedProjects ?? [], completedVisualizations: raw.completedVisualizations ?? [], events: raw.events ?? [] };
  const activity: Record<string, DayActivity> = {};
  for (const [k, v] of Object.entries(raw.activity ?? {})) {
    activity[k] = typeof v === 'number' ? { ...emptyDay(), minutes: v } : { ...emptyDay(), ...(v as Partial<DayActivity>) };
  }
  base.activity = activity;
  const problems: Record<string, ProblemRecord> = {};
  for (const [k, v] of Object.entries(raw.problems ?? {})) problems[k] = { ...emptyRecord(), ...(v as Partial<ProblemRecord>) };
  base.problems = problems;
  return base;
}

function finalize(s: PlayerStats): PlayerStats {
  const next = { ...s };
  next.level = calculatePlayerLevel(next.xp);
  next.streak = computeStreak(next.activity);
  next.bestStreak = Math.max(next.bestStreak, next.streak);
  if (!next.firstActiveDate) next.firstActiveDate = todayKey();
  for (let i = 0; i < 3; i++) {
    const newly = achievementsData.filter(a => !next.unlockedAchievements.includes(a.id) && evaluateAchievement(a, next));
    if (newly.length === 0) break;
    next.unlockedAchievements = [...next.unlockedAchievements, ...newly.map(a => a.id)];
    next.xp += newly.reduce((sum, a) => sum + a.xp, 0);
    next.level = calculatePlayerLevel(next.xp);
  }
  return next;
}

const bumpDay = (s: PlayerStats, patch: Partial<DayActivity>): Record<string, DayActivity> => {
  const t = todayKey(); const cur = s.activity[t] ?? emptyDay();
  return { ...s.activity, [t]: { minutes: cur.minutes + (patch.minutes ?? 0), problemsSolved: cur.problemsSolved + (patch.problemsSolved ?? 0), submissions: cur.submissions + (patch.submissions ?? 0), xpEarned: cur.xpEarned + (patch.xpEarned ?? 0), count: cur.count + (patch.count ?? 0) } };
};

const pushEvent = (s: PlayerStats, ev: ActivityEvent): ActivityEvent[] => [...s.events, ev].slice(-300);

export type SyncState = 'idle' | 'loading' | 'ready' | 'error';

interface Ctx {
  stats: PlayerStats;
  syncState: SyncState;
  retrySync: () => void;
  visitLesson: (id: string) => void;
  answerQuestion: (q: Question, correct: boolean) => void;
  completeLesson: (id: string, xp: number) => void;
  completeProject: (id: string, xp: number) => void;
  solveProblem: (p: Problem, correct: boolean) => void;
  toggleFavourite: (id: string) => void;
  toggleReview: (id: string) => void;
  toggleMastered: (id: string) => void;
  setConfidence: (id: string, v: 0 | 1 | 2 | 3) => void;
  setProblemNotes: (id: string, notes: string) => void;
  setScratchCode: (id: string, code: string) => void;
  completeVisualization: (id: string, xp: number) => void;
  resetProgress: () => void;
}
const PlayerContext = createContext<Ctx | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PlayerStats>(() => finalize(migrate(storageService.get<Partial<PlayerStats>>(KEY, {}))));
  const [syncState, setSyncState] = useState<SyncState>('idle');

  useEffect(() => {
    storageService.set(KEY, stats);
    storageService.set(UPDATED_KEY, Date.now());
    const t = window.setTimeout(() => { saveRemoteProgress(stats).catch(() => undefined); }, 1200);
    return () => window.clearTimeout(t);
  }, [stats]);

  const retrySync = useCallback(() => {
    setSyncState('loading');
    loadRemoteProgress()
      .then(remote => {
        if (remote) {
          const localUpdatedAt = storageService.get<number>(UPDATED_KEY, 0);
          if (remote.updatedAt > localUpdatedAt) setStats(finalize(migrate(remote.stats)));
        }
        setSyncState('ready');
      })
      .catch(() => setSyncState('error'));
  }, []);

  useEffect(() => { retrySync(); }, [retrySync]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setStats(prev => finalize({ ...prev, activity: bumpDay(prev, { minutes: 1 }) }));
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  const visitLesson = (id: string) => setStats(prev => prev.visitedLessons.includes(id) ? prev : finalize({ ...prev, visitedLessons: [...prev.visitedLessons, id] }));

  const answerQuestion = (q: Question, correct: boolean) => setStats(prev => {
    const rec = prev.practice[q.id];
    const everCorrect = (rec?.correct ?? false) || correct;
    const gained = correct && !rec?.correct ? q.xp : 0;
    return finalize({
      ...prev,
      practice: { ...prev.practice, [q.id]: { difficulty: q.difficulty, correct: everCorrect, tries: (rec?.tries ?? 0) + 1 } },
      completedQuestions: everCorrect && !prev.completedQuestions.includes(q.id) ? [...prev.completedQuestions, q.id] : prev.completedQuestions,
      xp: prev.xp + gained,
      activity: bumpDay(prev, gained ? { xpEarned: gained, count: 1 } : {}),
    });
  });

  const completeLesson = (id: string, xp: number) => setStats(prev => {
    if (prev.completedLessons.includes(id)) return prev;
    return finalize({
      ...prev,
      completedLessons: [...prev.completedLessons, id],
      lessonCompletedAt: { ...prev.lessonCompletedAt, [id]: todayKey() },
      xp: prev.xp + xp,
      activity: bumpDay(prev, { xpEarned: xp, count: 1 }),
      events: pushEvent(prev, { at: new Date().toISOString(), kind: 'lesson_completed', id, title: lessons[id]?.title ?? id, to: `/learn/lesson/${id}` }),
    });
  });

  const completeProject = (id: string, xp: number) => setStats(prev => {
    if (prev.completedProjects.includes(id)) return prev;
    return finalize({
      ...prev,
      completedProjects: [...prev.completedProjects, id],
      xp: prev.xp + xp,
      activity: bumpDay(prev, { xpEarned: xp, count: 1 }),
      events: pushEvent(prev, { at: new Date().toISOString(), kind: 'project_completed', id, title: projects.find(p => p.id === id)?.title ?? id }),
    });
  });

  const solveProblem = (p: Problem, correct: boolean) => setStats(prev => {
    const rec = prev.problems[p.id] ?? emptyRecord();
    const firstSolve = correct && !rec.solved;
    return finalize({
      ...prev,
      problems: { ...prev.problems, [p.id]: { ...rec, attempts: rec.attempts + 1, solved: rec.solved || correct, solvedDate: firstSolve ? todayKey() : rec.solvedDate, lastAttempted: todayKey() } },
      xp: prev.xp + (firstSolve ? p.xp : 0),
      activity: bumpDay(prev, { submissions: 1, problemsSolved: firstSolve ? 1 : 0, xpEarned: firstSolve ? p.xp : 0, count: firstSolve ? 1 : 0 }),
      events: firstSolve ? pushEvent(prev, { at: new Date().toISOString(), kind: 'problem_solved', id: p.id, title: p.title, to: `/practice/problems/${p.id}` }) : prev.events,
    });
  });

  const patchProblem = (id: string, fn: (rec: ProblemRecord) => ProblemRecord) => setStats(prev => {
    const rec = prev.problems[id] ?? emptyRecord();
    return { ...prev, problems: { ...prev.problems, [id]: fn(rec) } };
  });

  const completeVisualization = (id: string, xp: number) => setStats(prev => {
    if (prev.completedVisualizations.includes(id) || xp === 0) return prev;
    return finalize({
      ...prev,
      completedVisualizations: [...prev.completedVisualizations, id],
      xp: prev.xp + xp,
      activity: bumpDay(prev, { xpEarned: xp, count: 1 }),
      events: pushEvent(prev, { at: new Date().toISOString(), kind: 'visualization_completed', id, to: `/explore/viz/${id}` }),
    });
  });

  const resetProgress = () => setStats(finalize({ ...defaults }));

  return (
    <PlayerContext.Provider value={{
      stats, syncState, retrySync,
      visitLesson, answerQuestion, completeLesson, completeProject, solveProblem, completeVisualization, resetProgress,
      toggleFavourite: id => patchProblem(id, r => ({ ...r, favourite: !r.favourite })),
      toggleReview: id => patchProblem(id, r => ({ ...r, review: !r.review })),
      toggleMastered: id => patchProblem(id, r => ({ ...r, mastered: !r.mastered })),
      setConfidence: (id, v) => patchProblem(id, r => ({ ...r, confidence: v })),
      setProblemNotes: (id, notes) => patchProblem(id, r => ({ ...r, notes })),
      setScratchCode: (id, code) => patchProblem(id, r => ({ ...r, scratchCode: code })),
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): Ctx {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
