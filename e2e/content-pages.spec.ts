import { test, expect } from '@playwright/test';

/** Static content journeys — each must render its masthead and a key section. */
const PAGES: Array<{ path: string; heading: RegExp; marker: RegExp }> = [
  { path: '/subway-map', heading: /map/i, marker: /stations with sound|how to use the map/i },
  { path: '/culture', heading: /culture/i, marker: /featured/i },
  { path: '/history', heading: /history/i, marker: /timeline|abandoned/i },
  { path: '/subway-sounds', heading: /library/i, marker: /search by station/i },
];

test.describe('Content pages', () => {
  for (const p of PAGES) {
    test(`${p.path} renders`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(p.heading);
      await expect(page.getByText(p.marker).first()).toBeVisible();

      const noHScroll = await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1
      );
      expect(noHScroll).toBe(true);
    });
  }

  test('map page shows the interactive map container', async ({ page }) => {
    await page.goto('/subway-map');
    // MapLibre renders a canvas once the client map mounts.
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  });
});
