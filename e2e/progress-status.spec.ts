import { test, expect } from '@playwright/test';
import { lessons } from '../src/data/curriculum';
import { getLessonProgressSummary } from '../src/services/progressService';
import type { PlayerStats } from '../src/types';

const baseStats = (): PlayerStats => ({
  xp: 0, level: 1, streak: 0, bestStreak: 0,
  completedLessons: [], completedQuestions: [], unlockedAchievements: [], visitedLessons: [],
  lessonCompletedAt: {}, completedProjects: [], practice: {}, problems: {}, completedVisualizations: [],
  activity: {}, events: [], firstActiveDate: null,
});

const firstLesson = () => Object.values(lessons)[0];

test('unit: 0% → NOT_STARTED / "Not opened yet"', () => {
  const s = getLessonProgressSummary(baseStats(), firstLesson());
  expect(s.progress).toBe(0);
  expect(s.status).toBe('NOT_STARTED');
  expect(s.label).toBe('Not opened yet');
});

test('unit: 1–99% → IN_PROGRESS / "In progress"', () => {
  const stats = baseStats();
  stats.visitedLessons = [firstLesson().id];
  const s = getLessonProgressSummary(stats, firstLesson());
  expect(s.progress).toBeGreaterThan(0);
  expect(s.progress).toBeLessThan(100);
  expect(s.status).toBe('IN_PROGRESS');
  expect(s.label).toBe('In progress');
});

test('unit: 100% → COMPLETED / "Completed"', () => {
  const stats = baseStats();
  stats.completedLessons = [firstLesson().id];
  const s = getLessonProgressSummary(stats, firstLesson());
  expect(s.progress).toBe(100);
  expect(s.status).toBe('COMPLETED');
  expect(s.label).toBe('Completed');
});

test('e2e: brand-new hero shows "Not opened yet" at 0%', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Not opened yet').first()).toBeVisible();
});

test('e2e: after opening the lesson the hero never says "Not opened yet"', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Start First Lesson|Start Lesson|Continue Lesson/ }).first().click();
  await expect(page).toHaveURL(/\/learn\/lesson\//);
  await page.goto('/');
  await expect(page.getByText('Not opened yet')).toHaveCount(0);
  await expect(page.getByText('In progress').first()).toBeVisible();
});
