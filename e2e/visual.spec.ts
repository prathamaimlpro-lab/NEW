import { test, expect } from '@playwright/test';

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'curriculum', url: '/learn' },
  { name: 'lesson', url: '/learn/lesson/what-is-a-computer' },
  { name: 'practice', url: '/practice' },
  { name: 'vizlab', url: '/explore/viz/bubble-sort' },
  { name: 'admin-login', url: '/admin' },
] as const;

test.describe('visual regression (stable pages only)', () => {
  test.skip(({ browserName }, testInfo) => !['desktop', 'tablet-landscape'].includes(testInfo.project.name), 'snapshots only on desktop + tablet-landscape');
  for (const p of PAGES) {
    test(`visual ${p.name}`, async ({ page }) => {
      await page.goto(p.url);
      await expect(page.locator('main')).toBeVisible();
      await expect(page).toHaveScreenshot(`${p.name}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.02 });
    });
  }
  void 0;
});
