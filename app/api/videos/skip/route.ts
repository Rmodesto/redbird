import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { videoSkipBody } from '@/lib/video/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = videoSkipBody.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    await videoService.skipVideo(parsed.data.videoId, parsed.data.note);
    return apiSuccess({ skipped: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/skip] Error:', e);
    return serverError('Failed to skip video');
  }
}
