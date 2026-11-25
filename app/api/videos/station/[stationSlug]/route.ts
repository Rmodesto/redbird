import { NextRequest } from 'next/server';
import { apiSuccessWithCache, serverError } from '@/lib/api/responses';
import * as videoService from '@/lib/video/video.service';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, props: { params: Promise<{ stationSlug: string }> }) {
  const params = await props.params;
  try {
    const { stationSlug } = params;
    const data = await videoService.getVideosForStation(stationSlug);
    return apiSuccessWithCache(data, 300, 600);
  } catch (error) {
    console.error('[API /videos/station/[stationSlug]] Error:', error);
    return serverError('Failed to fetch station videos');
  }
}
