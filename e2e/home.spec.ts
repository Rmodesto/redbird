import { test, expect } from '@playwright/test';

test.describe('Home journey', () => {
  test('hero renders and the primary CTAs are present', async ({ page }) => {
    await page.goto('/');

    // Masthead hero — text is CSS-uppercased, so match case-insensitively.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/sound of/i);
    await expect(page.getByRole('link', { name: /find a station/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /watch the latest/i })).toBeVisible();

    // No sideways scroll on the body.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    );
    expect(overflow).toBe(true);
  });

  test('"Find a station" leads to the stations index', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /find a station/i }).first().click();
    await expect(page).toHaveURL(/\/stations\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/stations/i);
  });

  test('"Browse by line" section links into a line page', async ({ page }) => {
    await page.goto('/');
    const lineLink = page.locator('a[href^="/line/"]').first();
    await expect(lineLink).toBeVisible();
    await lineLink.click();
    await expect(page).toHaveURL(/\/line\/[^/]+$/);
  });
});
