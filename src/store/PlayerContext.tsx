import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { achievementsData } from '../data/achievements';
import { storageService } from '../services/storageService';
import { calculatePlayerLevel, computeStreak, todayKey } from '../services/xpService';
import { PlayerStats, Question } from '../types';

const KEY = 'it_quest_player_v2';

const defaults: PlayerStats = {
  xp: 0, level: 1, streak: 0, bestStreak: 0,
  completedLessons: [], completedQuestions: [], unlockedAchievements: [],
  visitedLessons: [], practice: {}, activity: {}, firstActiveDate: null,
};

function finalize(s: PlayerStats): PlayerStats {
  const next = { ...s };
  next.level = calculatePlayerLevel(next.xp);
  next.streak = computeStreak(next.activity);
  next.bestStreak = Math.max(next.bestStreak, next.streak);
  if (!next.firstActiveDate) next.firstActiveDate = todayKey();
  for (let i = 0; i < 3; i++) {
    const newly = achievementsData.filter(a => !next.unlockedAchievements.includes(a.id) && a.condition(next));
    if (newly.length === 0) break;
    next.unlockedAchievements = [...next.unlockedAchievements, ...newly.map(a => a.id)];
    next.xp += newly.reduce((sum, a) => sum + a.xp, 0);
    next.level = calculatePlayerLevel(next.xp);
  }
  return next;
}

interface Ctx {
  stats: PlayerStats;
  visitLesson: (id: string) => void;
  answerQuestion: (q: Question, correct: boolean) => void;
  completeLesson: (id: string, xp: number) => void;
  resetProgress: () => void;
}
const PlayerContext = createContext<Ctx | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<PlayerStats>(() =>
    finalize({ ...defaults, ...storageService.get<Partial<PlayerStats>>(KEY, {}) } as PlayerStats));

  useEffect(() => { storageService.set(KEY, stats); }, [stats]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setStats(prev => finalize({ ...prev, activity: { ...prev.activity, [todayKey()]: (prev.activity[todayKey()] ?? 0) + 1 } }));
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  const visitLesson = (id: string) => setStats(prev =>
    prev.visitedLessons.includes(id) ? prev : finalize({ ...prev, visitedLessons: [...prev.visitedLessons, id] }));

  const answerQuestion = (q: Question, correct: boolean) => setStats(prev => {
    const rec = prev.practice[q.id];
    const everCorrect = (rec?.correct ?? false) || correct;
    const practice = { ...prev.practice, [q.id]: { difficulty: q.difficulty, correct: everCorrect, tries: (rec?.tries ?? 0) + 1 } };
    const completedQuestions = everCorrect && !prev.completedQuestions.includes(q.id) ? [...prev.completedQuestions, q.id] : prev.completedQuestions;
    const xp = correct && !rec?.correct ? prev.xp + q.xp : prev.xp;
    return finalize({ ...prev, practice, completedQuestions, xp });
  });

  const completeLesson = (id: string, xp: number) => setStats(prev => {
    if (prev.completedLessons.includes(id)) return prev;
    return finalize({ ...prev, completedLessons: [...prev.completedLessons, id], xp: prev.xp + xp });
  });

  const resetProgress = () => setStats(finalize({ ...defaults }));

  return <PlayerContext.Provider value={{ stats, visitLesson, answerQuestion, completeLesson, resetProgress }}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): Ctx {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
