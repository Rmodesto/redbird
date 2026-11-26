import { test, expect } from '@playwright/test';

test.describe('Blog journey', () => {
  test('blog index renders masthead, filters and at least one post', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/underground|stories/i);
    await expect(page.getByPlaceholder(/search articles/i)).toBeVisible();
    expect(await page.locator('a[href^="/blog/"]').count()).toBeGreaterThan(0);
  });

  test('category filter is interactive', async ({ page }) => {
    await page.goto('/blog');
    const history = page.getByRole('button', { name: /history/i }).first();
    await history.click();
    // Still shows the count row / grid without error.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('opening a post renders the article', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('a[href^="/blog/"]').first().click();
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
