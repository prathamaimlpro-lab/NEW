import { test, expect } from '@playwright/test';

test('assessment flow: start, answer without leaked answers, submit, result, retry', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pixel_content_new_v1', JSON.stringify({
      assessments: [{
        id: 'as-l1', status: 'PUBLISHED', updatedAt: '2026-01-01T00:00:00.000Z',
        lessonId: 'what-is-a-computer', scope: 'lesson', title: 'Level 1 Check',
        questionIds: ['l1-q-easy-1'], passThreshold: 50, version: '1',
      }],
    }));
  });
  await page.goto('/learn/lesson/what-is-a-computer');
  const start = page.getByRole('button', { name: /Start assessment/ });
  await expect(start).toBeVisible();
  await start.click();
  const radios = page.getByRole('radio');
  await expect(radios.first()).toBeVisible();
  // no correctness revealed before submit: no correct/wrong styling present
  await expect(page.locator('.q-option.correct, .q-option.wrong')).toHaveCount(0);
  await radios.nth(1).check(); // the correct option for l1-q-easy-1
  await page.getByRole('button', { name: /Submit assessment/ }).click();
  await expect(page.getByText(/Score 100%/)).toBeVisible();
  await expect(page.getByText('Passed')).toBeVisible();
  await page.getByRole('button', { name: /Retry/ }).click();
  await expect(radios.first()).toBeVisible();
});
