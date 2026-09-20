import { test, expect } from '@playwright/test';

const REGIONS = [
  'Primary learning workspace', 'Learning activity', 'Mastery analytics', 'Practice analytics',
  'Knowledge graph', 'Learning intelligence', 'What changed', 'Learning heatmap', 'Visualization activity',
];

test('dashboard has exactly one h1 and all major labelled regions', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const name of REGIONS) {
    await expect(page.getByRole('region', { name }).first()).toBeAttached();
  }
});

test('no horizontal page overflow at key widths', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test('continue-learning progressbar exposes value semantics', async ({ page }) => {
  await page.goto('/');
  const pb = page.getByRole('progressbar').first();
  await expect(pb).toHaveAttribute('aria-valuenow');
  await expect(pb).toHaveAttribute('aria-valuemin', '0');
  await expect(pb).toHaveAttribute('aria-valuemax', '100');
});

test('day-0 learner sees honest empty analytics, not fake zeros', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/accuracy matrix appears after/i).first()).toBeVisible();
  await expect(page.getByText(/no learning activity recorded yet/i).first()).toBeVisible();
});

test('knowledge graph provides a keyboard-friendly list alternative', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Concept list' })).toBeAttached();
});

test('heatmap offers a non-color data alternative', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /List view/ });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.getByRole('list', { name: 'Active days' })).toBeAttached();
  }
});
