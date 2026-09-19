import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { KEY_ROUTES } from './helpers';

for (const route of [...KEY_ROUTES, '/admin']) {
  test(`axe wcag2a/aa: no critical/serious violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const bad = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(bad, bad.map(v => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
  });
}

test('interactive elements in main have accessible names (Home)', async ({ page }) => {
  await page.goto('/');
  const unnamed = await page.locator('main button, main a').evaluateAll(els =>
    els.filter(el => !(el.textContent || '').trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length,
  );
  expect(unnamed).toBe(0);
});

test('pages expose a single h1 and a main landmark', async ({ page }) => {
  for (const route of ['/', '/learn', '/practice']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
});
