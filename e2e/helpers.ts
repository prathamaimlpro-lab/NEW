import { Page, expect } from '@playwright/test';

export const KEY_ROUTES = ['/', '/learn', '/practice', '/explore', '/progress', '/profile'] as const;
export const OVERFLOW_WIDTHS = [320, 360, 375, 390, 430, 600, 768, 800, 1024, 1280, 1440];

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(String(err)));
  return errors;
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'unexpected horizontal page overflow').toBeLessThanOrEqual(0);
}

export async function expectMainRendered(page: Page) {
  await expect(page.locator('main')).toBeVisible();
  const text = (await page.locator('main').innerText()).trim();
  expect(text.length, 'main content must not be blank').toBeGreaterThan(0);
}
