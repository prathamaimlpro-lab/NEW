import { Achievement, PlayerStats } from '../types';

export function evaluateAchievement(a: Achievement, s: PlayerStats): boolean {
  if (a.rule) {
    const v = a.rule.value;
    switch (a.rule.kind) {
      case 'lessons': return s.completedLessons.length >= v;
      case 'questions': return s.completedQuestions.length >= v;
      case 'problems': return Object.values(s.problems).filter(p => p.solved).length >= v;
      case 'streak': return s.streak >= v;
      case 'playerLevel': return s.level >= v;
      case 'xp': return s.xp >= v;
      case 'visualizations': return s.completedVisualizations.length >= v;
    }
  }
  return a.condition ? a.condition(s) : false;
}
