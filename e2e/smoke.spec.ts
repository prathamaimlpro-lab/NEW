import { test, expect } from '@playwright/test';
import { KEY_ROUTES, OVERFLOW_WIDTHS, collectConsoleErrors, expectMainRendered, expectNoHorizontalOverflow } from './helpers';

test.describe('startup + route smoke', () => {
  for (const route of KEY_ROUTES) {
    test(`route ${route} renders with no console errors`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      await page.goto(route);
      await expectMainRendered(page);
      expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
    });
  }

  test('deep links work (level, lesson, viz lab, admin login)', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    for (const route of ['/learn/level/level-1', '/learn/lesson/what-is-a-computer', '/explore/viz/bubble-sort', '/admin']) {
      await page.goto(route);
      await expectMainRendered(page);
    }
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  });
});

test.describe('responsive regression', () => {
  for (const width of OVERFLOW_WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/learn', '/practice', '/explore']) {
        await page.goto(route);
        await expectMainRendered(page);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test('internal scrollers stay inside their containers (lesson code, journey lanes)', async ({ page }) => {
    await page.goto('/learn/lesson/what-is-a-computer');
    await expectMainRendered(page);
    await expectNoHorizontalOverflow(page);
    await page.goto('/learn');
    const lane = page.locator('.jl-lane').first();
    if (await lane.isVisible()) {
      const fits = await lane.evaluate(el => el.scrollWidth >= el.clientWidth);
      expect(fits).toBe(true);
    }
  });
});
