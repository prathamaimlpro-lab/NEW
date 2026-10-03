import { test, expect } from '@playwright/test';

test('practice bank serves published content questions and hides drafts', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pixel_content_new_v1', JSON.stringify({
      practice: [
        { id: 'tq-easy', status: 'PUBLISHED', updatedAt: '2026-01-01T00:00:00.000Z', conceptId: 'l1-c-what-is-a-computer', difficulty: 'EASY', prompt: 'BANK EASY QUESTION', options: ['correct option', 'wrong option'], answerIndex: 0, explanation: 'because it is correct' },
        { id: 'tq-draft', status: 'DRAFT', updatedAt: '2026-01-01T00:00:00.000Z', conceptId: 'l1-c-what-is-a-computer', difficulty: 'EASY', prompt: 'BANK DRAFT QUESTION', options: ['a', 'b'], answerIndex: 0, explanation: 'x' },
      ],
    }));
  });
  await page.goto('/practice');
  await expect(page.getByText('BANK EASY QUESTION')).toBeVisible();
  await expect(page.getByText('BANK DRAFT QUESTION')).toHaveCount(0);

  // select → check → explanation
  await page.getByRole('button', { name: /correct option/ }).click();
  await expect(page.getByRole('button', { name: /correct option/ })).toHaveClass(/selected/);
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText('because it is correct')).toBeVisible();
  await expect(page.getByRole('button', { name: /correct option/ })).toHaveClass(/correct/);
});

test('difficulty chips filter the bank', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pixel_content_new_v1', JSON.stringify({
      practice: [
        { id: 'tq-easy', status: 'PUBLISHED', updatedAt: '2026-01-01T00:00:00.000Z', conceptId: 'l1-c-what-is-a-computer', difficulty: 'EASY', prompt: 'BANK EASY QUESTION', options: ['a', 'b'], answerIndex: 0, explanation: 'x' },
      ],
    }));
  });
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Medium', exact: true }).click();
  await expect(page.getByText('BANK EASY QUESTION')).toHaveCount(0);
});
