import { apiSuccess, apiError, serverError } from '@/lib/api/responses';
import { requireAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await videoService.getStats();
    return apiSuccess(stats);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/stats] Error:', e);
    return serverError('Failed to load stats');
  }
}
