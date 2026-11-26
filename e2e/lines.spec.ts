import { test, expect } from '@playwright/test';

test.describe('Lines journey', () => {
  test('lines index renders the masthead and line list', async ({ page }) => {
    await page.goto('/lines');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/lines/i);

    // Filter pills and line rows are present.
    await expect(page.getByRole('button', { name: /all lines/i })).toBeVisible();
    const lineLinks = page.locator('a[href^="/line/"]');
    expect(await lineLinks.count()).toBeGreaterThan(5);
  });

  test('trunk filter narrows the list', async ({ page }) => {
    await page.goto('/lines');
    const before = await page.locator('a[href^="/line/"]').count();
    await page.getByRole('button', { name: /lexington/i }).first().click();
    // After filtering to one trunk the visible line rows should drop.
    await expect
      .poll(async () => page.locator('a[href^="/line/"]').count())
      .toBeLessThan(before);
  });

  test('opening a line shows its detail page', async ({ page }) => {
    await page.goto('/lines');
    await page.locator('a[href^="/line/"]').first().click();
    await expect(page).toHaveURL(/\/line\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Reference line page exposes Stations / Sounds / Map tabs.
    await expect(page.getByText(/stations/i).first()).toBeVisible();
  });
});
