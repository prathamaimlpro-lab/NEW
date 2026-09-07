import { Achievement } from '../types';

export const achievementsData: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first lesson.', icon: 'flag', xp: 0, rule: { kind: 'lessons', value: 1 } },
  { id: 'hardware-quiz', title: 'Hardware Foundations Quiz', description: 'Answer a practice question correctly.', icon: 'check-circle', xp: 40, rule: { kind: 'questions', value: 1 } },
  { id: 'problem-solver', title: 'Problem Solver', description: 'Solve your first tracked problem.', icon: 'bolt', xp: 20, rule: { kind: 'problems', value: 1 } },
  { id: 'binary-decoded', title: 'First Binary Byte Decoded', description: 'Complete Bits, Bytes & Binary.', icon: 'terminal', xp: 25, rule: { kind: 'lessons', value: 2 } },
  { id: 'practice-warrior', title: 'Practice Warrior', description: 'Answer 10 questions correctly.', icon: 'bolt', xp: 0, rule: { kind: 'questions', value: 10 } },
  { id: 'streak-starter', title: 'Streak Starter', description: 'Maintain a 3-day learning streak.', icon: 'flame', xp: 0, rule: { kind: 'streak', value: 3 } },
  { id: 'level-up', title: 'Promotion', description: 'Reach player level 2.', icon: 'shield', xp: 0, rule: { kind: 'playerLevel', value: 2 } },
  { id: 'computer-explorer', title: 'Computer Explorer', description: 'Complete World 1 foundations.', icon: 'award', xp: 100, rule: { kind: 'lessons', value: 3 } },
];
