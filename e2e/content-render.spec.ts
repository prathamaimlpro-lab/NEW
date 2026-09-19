import { test, expect } from '@playwright/test';

const LESSON = '/learn/lesson/what-is-a-computer';

test('level 1 lesson renders the full content chain from published data', async ({ page }) => {
  await page.goto(LESSON);
  await expect(page.getByRole('heading', { name: 'What Is a Computer?' }).first()).toBeVisible();
  await expect(page.getByText('Thermostat loop')).toBeVisible();
  await expect(page.getByRole('link', { name: /Open in Visualization Lab/ }).first()).toBeVisible();
  await expect(page.getByText('A computer is best described as a machine that…')).toBeVisible();
  await expect(page.getByText(/Map a device you use daily/)).toBeVisible();
  await expect(page.getByText(/Restate the input/)).toBeVisible();
  await expect(page.getByText(/Correctly apply the input/)).toBeVisible();
});

test('changing content data changes the rendered lesson without code changes', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pixel_content_new_v1', JSON.stringify({
      concepts: [{
        id: 'l1-c-what-is-a-computer', status: 'PUBLISHED', updatedAt: '2026-01-01T00:00:00.000Z',
        title: 'CHANGED TITLE FROM CMS', topicIds: [],
        facets: [{ key: 'WHAT', body: 'CHANGED BODY FROM CMS' }],
        exampleIds: [], visualIds: [], practiceIds: [], projectIds: [], revisionIds: [], prerequisiteConceptIds: [],
      }],
    }));
  });
  await page.goto(LESSON);
  await expect(page.getByRole('heading', { name: 'CHANGED TITLE FROM CMS' })).toBeVisible();
  await expect(page.getByText('CHANGED BODY FROM CMS')).toBeVisible();
});
