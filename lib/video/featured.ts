import * as videoService from './video.service';
import { mtaDataService } from '@/lib/services/mta-data-service';

/**
 * The recording the homepage hero leads with.
 *
 * Pinned rather than "newest" so the front door does not change every time the
 * library syncs. Override with NEXT_PUBLIC_HERO_VIDEO_ID without a code change.
 */
export const HERO_VIDEO_ID = process.env.NEXT_PUBLIC_HERO_VIDEO_ID || '2-jdBVbAMWs';

export interface FeaturedVideo {
  youtubeId: string;
  title: string;
  /** Already formatted, e.g. "4:12". Null when no duration is known. */
  duration: string | null;
  /** Services at the station this recording is filed under. Empty when unknown. */
  lines: string[];
}

/** ISO 8601 duration → "4:12". Null when unparseable. */
function formatDuration(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const [, h, min, s] = m;
  const mm = min ?? '0';
  const ss = (s ?? '0').padStart(2, '0');
  return h ? `${h}:${mm.padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

/** Look the pinned video up on YouTube when it is not in our own library. */
async function fetchFromYouTube(id: string): Promise<FeaturedVideo | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('id', id);
    url.searchParams.set('key', key);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();
    const item = json?.items?.[0];
    if (!item) return null;

    return {
      youtubeId: id,
      title: item.snippet?.title ?? '',
      duration: formatDuration(item.contentDetails?.duration),
      lines: [],
    };
  } catch {
    return null;
  }
}

/**
 * Resolve the hero recording.
 *
 * Our own library first — it carries the station association, which is what
 * supplies the line badges. Falls back to the YouTube API for a pinned video we
 * have not synced yet, and finally to the bare id so the still and the player
 * still work with no title. Returns null only when there is no id at all.
 */
export async function getFeaturedVideo(): Promise<FeaturedVideo | null> {
  if (!HERO_VIDEO_ID) return null;

  try {
    const { videos } = await videoService.getVideos(1, 200, 'ACTIVE');
    const own = videos.find((v) => v.youtubeId === HERO_VIDEO_ID);

    if (own) {
      const slug = own.stations[0]?.stationSlug;
      const station = slug ? mtaDataService.getStationBySlug(slug) : null;
      return {
        youtubeId: own.youtubeId,
        title: own.title,
        duration: formatDuration(own.duration),
        lines: station?.lines ?? [],
      };
    }
  } catch {
    // Database unavailable at build time — fall through to the API.
  }

  return (await fetchFromYouTube(HERO_VIDEO_ID)) ?? {
    youtubeId: HERO_VIDEO_ID,
    title: '',
    duration: null,
    lines: [],
  };
}
