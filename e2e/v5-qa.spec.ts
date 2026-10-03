import { test, expect } from '@playwright/test';

const WIDTHS = [320, 375, 430, 600, 768, 800, 1024, 1280, 1440, 1920];

test('no horizontal page overflow at any supported width', async ({ page }) => {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow at ${w}px`).toBeLessThanOrEqual(0);
  }
});

test('Xiaomi Pad 7 portrait + landscape: no overflow', async ({ page }) => {
  for (const vp of [{ width: 800, height: 1280 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(vp);
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(0);
  }
});

test('segmented tabs are keyboard operable', async ({ page }) => {
  await page.goto('/practice');
  const tab = page.getByRole('tab', { name: 'Assessments' });
  await tab.focus();
  await page.keyboard.press('Enter');
  await expect(tab).toHaveAttribute('aria-selected', 'true');
});

test('reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const dur = await page.evaluate(() => getComputedStyle(document.querySelector('.btn')!).transitionDuration);
  expect(dur).toMatch(/0s|0\.01ms/);
});

test('day-0 dashboard shows honest empty states, not fake zeros', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/no practice attempts yet/i).first()).toBeVisible();
  await expect(page.getByText(/no learning activity recorded yet/i).first()).toBeVisible();
});

test('section indices expose heading hierarchy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h2').first()).toBeAttached();
});
