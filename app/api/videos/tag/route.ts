import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { videoTagBody } from '@/lib/video/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = videoTagBody.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    await videoService.tagVideoToStation(parsed.data.videoId, parsed.data.stationSlug);
    return apiSuccess({ tagged: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/tag POST] Error:', e);
    return serverError('Failed to tag video');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = videoTagBody.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    await videoService.untagVideoFromStation(parsed.data.videoId, parsed.data.stationSlug);
    return apiSuccess({ untagged: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/tag DELETE] Error:', e);
    return serverError('Failed to untag video');
  }
}
