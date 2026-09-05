import { levels } from './curriculum';
import { levelLessons } from '../services/progressService';
import { Achievement, PlayerStats } from '../types';

const l0 = levels[0];
const correctCount = (s: PlayerStats) => Object.values(s.practice).filter(p => p.correct).length;
const solvedCount = (s: PlayerStats) => Object.values(s.problems).filter(r => r.solved).length;

export const achievementsData: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first lesson.', icon: 'flag', xp: 0, condition: s => s.completedLessons.length >= 1 },
  { id: 'hardware-quiz', title: 'Hardware Foundations Quiz', description: 'Answer a practice question correctly.', icon: 'check-circle', xp: 40, condition: s => correctCount(s) >= 1 },
  { id: 'problem-solver', title: 'Problem Solver', description: 'Solve your first tracked problem.', icon: 'bolt', xp: 20, condition: s => solvedCount(s) >= 1 },
  { id: 'binary-decoded', title: 'First Binary Byte Decoded', description: 'Complete Bits, Bytes & Binary.', icon: 'terminal', xp: 25, condition: s => s.completedLessons.includes('bits-bytes-binary') },
  { id: 'practice-warrior', title: 'Practice Warrior', description: 'Answer 10 questions correctly.', icon: 'bolt', xp: 0, condition: s => correctCount(s) >= 10 },
  { id: 'streak-starter', title: 'Streak Starter', description: 'Maintain a 3-day learning streak.', icon: 'flame', xp: 0, condition: s => s.streak >= 3 },
  { id: 'level-up', title: 'Promotion', description: 'Reach player level 2.', icon: 'shield', xp: 0, condition: s => s.level >= 2 },
  { id: 'computer-explorer', title: 'Computer Explorer', description: 'Complete World 1 foundations.', icon: 'award', xp: 100, condition: s => levelLessons(l0).every(l => s.completedLessons.includes(l.id)) },
];
