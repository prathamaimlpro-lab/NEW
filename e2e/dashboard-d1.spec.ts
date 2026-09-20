import { test, expect } from '@playwright/test';
import { problems } from '../src/data/problems';
import {
  classifyLearner, selectCurriculumJourney, selectLearningVelocity, selectMasteryAnalytics,
  selectPracticeAnalytics, selectWeaknessIntelligence,
} from '../src/dashboard/selectors';
import type { PlayerStats } from '../src/types';

const base = (): PlayerStats => ({
  xp: 0, level: 1, streak: 0, bestStreak: 0,
  completedLessons: [], completedQuestions: [], unlockedAchievements: [], visitedLessons: [],
  lessonCompletedAt: {}, completedProjects: [], practice: {}, problems: {}, completedVisualizations: [],
  activity: {}, events: [], firstActiveDate: null,
});
const rec = (attempts: number, solved: number) => ({
  attempts, solved, solvedDate: null, favourite: false, review: false, mastered: false,
  confidence: 0, notes: '', scratchCode: '', timeSpent: 0, lastAttempted: null,
});

test('day-0 learner: structural zones ready, analytics empty', () => {
  const s = base();
  expect(classifyLearner(s)).toBe('day0');
  expect(selectPracticeAnalytics(s).matrix.status).toBe('empty');
  expect(selectLearningVelocity(s).status).toBe('empty');
  expect(selectCurriculumJourney(s).status).toBe('ready');
});

test('practice matrix threshold is exactly 10 attempts', () => {
  const s = base();
  const id = problems[0].id;
  s.problems = { [id]: rec(9, 5) };
  expect(selectPracticeAnalytics(s).matrix.status).toBe('insufficient');
  s.problems = { [id]: rec(10, 6) };
  expect(selectPracticeAnalytics(s).matrix.status).toBe('ready');
});

test('weakness intelligence requires >=5 attempts per topic', () => {
  const s = base();
  const id = problems[0].id;
  s.problems = { [id]: rec(4, 0) };
  expect(selectWeaknessIntelligence(s).status).toBe('insufficient');
  s.problems = { [id]: rec(5, 0) };
  expect(selectWeaknessIntelligence(s).status).toBe('ready');
});

test('completion is not mastery', () => {
  const s = base();
  s.completedLessons = ['what-is-a-computer'];
  expect(selectMasteryAnalytics(s).status).toBe('empty');
});

test('learning velocity requires >=2 weeks of history', () => {
  const s = base();
  s.firstActiveDate = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  expect(selectLearningVelocity(s).status).toBe('insufficient');
  s.firstActiveDate = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  expect(selectLearningVelocity(s).status).toBe('ready');
});
