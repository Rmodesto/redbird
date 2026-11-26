import { test, expect } from '@playwright/test';

/** Header nav target → URL it must land on, and a heading substring to confirm. */
const NAV: Array<{ href: string; url: RegExp; heading: RegExp }> = [
  { href: '/stations', url: /\/stations\/?$/, heading: /stations/i },
  { href: '/lines', url: /\/lines\/?$/, heading: /lines/i },
  { href: '/subway-map', url: /\/subway-map\/?$/, heading: /map/i },
  { href: '/subway-sounds', url: /\/subway-sounds\/?$/, heading: /library/i },
  { href: '/blog', url: /\/blog\/?$/, heading: /underground|stories/i },
  { href: '/history', url: /\/history\/?$/, heading: /history/i },
  { href: '/culture', url: /\/culture\/?$/, heading: /culture/i },
];

test.describe('Global navigation', () => {
  for (const item of NAV) {
    test(`header nav → ${item.href}`, async ({ page }) => {
      await page.goto('/');
      // Scope to the site header so we don't catch footer/body links.
      await page.locator(`header a[href="${item.href}"]`).first().click();
      await expect(page).toHaveURL(item.url);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(item.heading);
    });
  }

  test('logo returns to home', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('header a[href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
  });
});
