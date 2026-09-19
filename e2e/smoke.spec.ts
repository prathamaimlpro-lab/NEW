import { test, expect } from '@playwright/test';
import {
  KEY_ROUTES, OVERFLOW_WIDTHS,
  collectConsoleErrors, collectFailedRequests, expectMainRendered, expectNoHorizontalOverflow, expectWithinViewport,
} from './helpers';

const ALL_ROUTES = [
  ...KEY_ROUTES,
  '/learn/level/level-1',
  '/learn/lesson/what-is-a-computer',
  '/explore/viz/bubble-sort',
];

test.describe('startup + route smoke', () => {
  for (const route of ALL_ROUTES) {
    test(`route ${route} renders with no console errors`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      const failed = await collectFailedRequests(page);
      await page.goto(route);
      await expectMainRendered(page);
      expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
      expect(failed).toEqual([]);
    });
  }
});

test.describe('responsive overflow + viewport containment', () => {
  for (const width of OVERFLOW_WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/learn', '/practice', '/explore', '/progress']) {
        await page.goto(route);
        await expectMainRendered(page);
        await expectNoHorizontalOverflow(page);
        await expectWithinViewport(page, page.locator('main > *').first());
      }
    });
  }
});

test.describe('browser back / forward', () => {
  test('back/forward preserve navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/learn');
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/learn/);
  });
});
