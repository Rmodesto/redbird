import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { videoPinBody } from '@/lib/video/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = videoPinBody.safeParse(await req.json());
    if (!parsed.success) return validationError(parsed.error);
    await videoService.pinVideoToPost(parsed.data.videoId, parsed.data.postId);
    return apiSuccess({ pinned: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/pin POST] Error:', e);
    return serverError('Failed to pin video');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = videoPinBody.safeParse(await req.json());
    if (!parsed.success) return validationError(parsed.error);
    await videoService.unpinVideoFromPost(parsed.data.videoId, parsed.data.postId);
    return apiSuccess({ unpinned: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('[API /videos/pin DELETE] Error:', e);
    return serverError('Failed to unpin video');
  }
}
