import { test, expect } from '@playwright/test';

test('lesson shows a concept mastery tier distinct from completion', async ({ page }) => {
  await page.goto('/learn/lesson/what-is-a-computer');
  await expect(page.getByText(/Mastery:/).first()).toBeVisible();
});

test('revision mode shows a safe state for a new learner', async ({ page }) => {
  await page.goto('/practice');
  await page.getByRole('button', { name: /Revision/ }).first().click();
  await expect(page.getByText(/No revision needed|Concept revision/).first()).toBeVisible();
});
