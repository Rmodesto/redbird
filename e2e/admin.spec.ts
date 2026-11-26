import { test, expect } from '@playwright/test';

test.describe('Admin gating (anonymous)', () => {
  test('anonymous users cannot reach the video tagger', async ({ page }) => {
    await page.goto('/admin/videos');

    // Either redirected away from the admin route, or shown a sign-in screen —
    // never the tagger itself.
    const url = page.url();
    const onAdmin = /\/admin\/videos/.test(url);
    const taggerVisible = await page
      .getByRole('button', { name: /save tags/i })
      .isVisible()
      .catch(() => false);

    expect(taggerVisible).toBe(false);
    if (onAdmin) {
      // If routing kept the URL, the protected content must still be absent.
      await expect(page.getByText(/now tagging/i)).toHaveCount(0);
    }
  });

  test('protected video write API rejects anonymous callers', async ({ request }) => {
    const res = await request.post('/api/videos/save-tags', {
      data: { videoId: 'x', stationSlugs: ['1-av'] },
    });
    expect([401, 403, 404]).toContain(res.status());
  });

  test('hidden videos are not exposed on the public list', async ({ request }) => {
    const res = await request.get('/api/videos?status=HIDDEN&limit=5');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const videos = body?.data?.videos ?? body?.videos ?? [];
    for (const v of videos) {
      expect(v.status).toBe('ACTIVE');
    }
  });
});
