import { test, expect } from '@playwright/test';

test('sidebar navigation reaches every primary route', async ({ page }) => {
  await page.goto('/');
  for (const [label, path] of [['Learn', '/learn'], ['Practice', '/practice'], ['Explore', '/explore'], ['Progress', '/progress'], ['Profile', '/profile']] as const) {
    await page.locator('nav.sb-nav').getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(path));
  }
});

test('Continue Learning CTA opens the current lesson', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: /Continue Lesson|Start Lesson|Start First Lesson|^Begin$/ }).first();
  await cta.click();
  await expect(page).toHaveURL(/\/learn\/lesson\//);
});

test('curriculum world accordion expands and shows levels', async ({ page }) => {
  await page.goto('/learn');
  const toggle = page.locator('button[aria-controls="world-world-1-levels"]');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.locator('#world-world-1-levels')).toBeVisible();
});

test('lesson practice answers give immediate feedback', async ({ page }) => {
  await page.goto('/learn/lesson/what-is-a-computer');
  const option = page.locator('.q-option').first();
  await option.click();
  await expect(page.locator('.q-option.correct, .q-option.wrong').first()).toBeVisible();
});

test('practice tracker filters respond', async ({ page }) => {
  await page.goto('/practice');
  await page.getByRole('button', { name: 'Problem Tracker' }).click();
  const before = await page.locator('.card-interactive').count();
  await page.getByLabel('Difficulty filter').selectOption('HARD');
  const after = await page.locator('.card-interactive').count();
  expect(after).toBeLessThanOrEqual(before);
});

test('visualization lab step control advances the algorithm', async ({ page }) => {
  await page.goto('/explore/viz/bubble-sort');
  await page.getByRole('button', { name: 'Step', exact: true }).click();
  await expect(page.getByText(/comparing/i).first()).toBeVisible();
});

test('skill map node selection opens the inspector', async ({ page }) => {
  await page.goto('/');
  await page.locator('.sk-node').first().click();
  await expect(page.locator('.sk-detail')).toBeVisible();
});

test('quick find dialog opens, focuses and closes with Escape', async ({ page, browserName }, testInfo) => {
  test.skip(['mobile', 'narrow', 'tablet-portrait'].includes(testInfo.project.name), 'search trigger hidden below 1024px');
  await page.goto('/');
  await page.locator('.sb-search').click();
  const dialog = page.getByRole('dialog', { name: 'Quick find' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  void browserName;
});

test('admin login screen renders without credentials', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});
