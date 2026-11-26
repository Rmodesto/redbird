import { NextRequest } from 'next/server';
import { apiSuccess, validationError, serverError } from '@/lib/api/responses';
import { videoListQuery } from '@/lib/video/schemas';
import { isAdmin } from '@/lib/blog/auth';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = videoListQuery.safeParse(params);
    if (!parsed.success) return validationError(parsed.error);

    const { page, limit, search } = parsed.data;

    // This route is public (middleware allowlist) but is also used by the admin
    // tagger. Only admins may see HIDDEN videos or filter by tag-review state;
    // anonymous/non-admin callers are clamped to publicly listable (ACTIVE)
    // recordings regardless of the query they send.
    const admin = await isAdmin();
    const status = admin ? parsed.data.status : 'ACTIVE';
    const tagState = admin ? parsed.data.tagState : undefined;

    const data = await videoService.getVideos(page, limit, status, search, tagState);
    return apiSuccess(data);
  } catch (error) {
    console.error('[API /videos] Error:', error);
    return serverError('Failed to fetch videos');
  }
}
