import { test, expect } from '@playwright/test';

const PATHS = ['/', '/lines', '/stations', '/blog', '/culture', '/history', '/subway-sounds'];

test.describe('Mobile responsive', () => {
  for (const path of PATHS) {
    test(`${path} has no horizontal overflow on mobile`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const noHScroll = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1
      );
      expect(noHScroll).toBe(true);
    });
  }

  test('mobile header exposes a menu toggle, not the full nav inline', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    await expect(toggle).toBeVisible();

    // Nav is collapsed until the toggle is tapped.
    await expect(page.locator('header nav:visible')).toHaveCount(0);

    await toggle.click();
    // The opened mobile nav (the only visible one) exposes the links.
    await expect(
      page.locator('header nav:visible').getByRole('link', { name: /stations/i })
    ).toBeVisible();
  });
});
