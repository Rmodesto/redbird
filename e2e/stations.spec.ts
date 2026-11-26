import { test, expect } from '@playwright/test';

test.describe('Stations journey', () => {
  test('stations index renders masthead, filters and the A–Z list', async ({ page }) => {
    await page.goto('/stations');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/stations/i);
    await expect(page.getByRole('button', { name: /manhattan/i })).toBeVisible();
    expect(await page.locator('a[href^="/station/"]').count()).toBeGreaterThan(20);
  });

  test('search narrows the station list', async ({ page }) => {
    await page.goto('/stations');
    const before = await page.locator('a[href^="/station/"]').count();
    await page.getByPlaceholder(/search/i).first().fill('Bedford');
    await expect
      .poll(async () => page.locator('a[href^="/station/"]').count())
      .toBeLessThan(before);
    await expect(page.locator('a[href^="/station/"]').first()).toContainText(/bedford/i);
  });

  test('opening a station shows detail with lines served', async ({ page }) => {
    await page.goto('/stations');
    await page.locator('a[href^="/station/"]').first().click();
    await expect(page).toHaveURL(/\/station\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/lines served/i)).toBeVisible();
  });
});
