import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { videoSyncBody } from '@/lib/video/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = videoSyncBody.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return apiError('YouTube API key not configured', 500);

    const result = await videoService.syncFromYouTube(parsed.data.channelId, apiKey);
    return apiSuccess(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/sync] Error:', e);
    return serverError('Failed to sync videos');
  }
}
