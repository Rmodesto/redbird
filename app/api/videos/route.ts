import { NextRequest } from 'next/server';
import { apiSuccess, validationError, serverError } from '@/lib/api/responses';
import { videoListQuery } from '@/lib/video/schemas';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = videoListQuery.safeParse(params);
    if (!parsed.success) return validationError(parsed.error);

    const { page, limit, status, search } = parsed.data;
    const data = await videoService.getVideos(page, limit, status, search);
    return apiSuccess(data);
  } catch (error) {
    console.error('[API /videos] Error:', error);
    return serverError('Failed to fetch videos');
  }
}
