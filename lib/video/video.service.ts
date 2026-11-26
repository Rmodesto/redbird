import * as repo from './video.repository';
import { matchVideo } from './station-matcher';

// ─── API Types ───────────────────────────────────────────────────────────────

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string | null;
  duration: string | null;
  tags: string[];
  status: string;
  reviewed: boolean;
  reviewedAt: string | null;
  stations: { stationSlug: string; matchType: string; confidence: number }[];
  posts: { postId: string; position: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoStats {
  total: number;
  untagged: number;
  needsReview: number;
  tagged: number;
  lastSyncedAt: string | null;
}

export interface VideoListResponse {
  videos: VideoItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StationVideosResponse {
  videos: VideoItem[];
  stationSlug: string;
  total: number;
}

export interface VideoSyncResult {
  newVideos: number;
  updatedVideos: number;
  totalProcessed: number;
  matchedStations: number;
  errors: string[];
}

// ─── DTO Mapping ─────────────────────────────────────────────────────────────

type VideoWithStations = NonNullable<Awaited<ReturnType<typeof repo.findById>>>;

function toApiVideo(video: VideoWithStations): VideoItem {
  return {
    id: video.id,
    youtubeId: video.youtubeId,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    channelId: video.channelId,
    channelTitle: video.channelTitle,
    publishedAt: video.publishedAt?.toISOString() ?? null,
    duration: video.duration,
    tags: JSON.parse(video.tags),
    status: video.status,
    reviewed: video.reviewed,
    reviewedAt: video.reviewedAt?.toISOString() ?? null,
    stations: video.stations.map((s) => ({
      stationSlug: s.stationSlug,
      matchType: s.matchType,
      confidence: s.confidence,
    })),
    posts: video.posts.map((p) => ({ postId: p.postId, position: p.position })),
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getVideosForStation(stationSlug: string): Promise<StationVideosResponse> {
  const videos = await repo.findByStationSlug(stationSlug);
  return {
    videos: videos.map(toApiVideo),
    stationSlug,
    total: videos.length,
  };
}

export async function getVideos(
  page: number,
  limit: number,
  status?: string,
  search?: string,
  tagState?: repo.TagState,
): Promise<VideoListResponse> {
  const { videos, total } = await repo.findMany({ page, limit, status, search, tagState });
  return {
    videos: videos.map(toApiVideo),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStats(): Promise<VideoStats> {
  const s = await repo.getStats();
  return {
    total: s.total,
    untagged: s.untagged,
    needsReview: s.needsReview,
    tagged: s.tagged,
    lastSyncedAt: s.lastSyncedAt ? s.lastSyncedAt.toISOString() : null,
  };
}

/** Confirm a video's station set (the tagger's SAVE TAGS). */
export async function saveStationTags(videoId: string, stationSlugs: string[]): Promise<void> {
  await repo.saveStationTags(videoId, stationSlugs);
}

/** Mark reviewed with no stations (SKIP). */
export async function skipVideo(videoId: string, note?: string): Promise<void> {
  await repo.skipVideo(videoId, note);
}

export async function resetReview(videoId: string): Promise<void> {
  await repo.resetReview(videoId);
}

export async function pinVideoToPost(videoId: string, postId: string): Promise<void> {
  await repo.pinToPost(videoId, postId);
}

export async function unpinVideoFromPost(videoId: string, postId: string): Promise<void> {
  await repo.unpinFromPost(videoId, postId);
}

export async function getVideoById(id: string): Promise<VideoItem | null> {
  const video = await repo.findById(id);
  return video ? toApiVideo(video) : null;
}

export async function tagVideoToStation(videoId: string, stationSlug: string): Promise<void> {
  await repo.addManualAssociation(videoId, stationSlug);
}

export async function untagVideoFromStation(videoId: string, stationSlug: string): Promise<void> {
  await repo.removeAssociation(videoId, stationSlug);
}

// ─── YouTube Sync ────────────────────────────────────────────────────────────

interface YouTubeVideoData {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  duration: string | null;
  tags: string[];
  location: { latitude: number; longitude: number } | null;
}

/**
 * Minimum confidence for an automatic station association.
 *
 * Measured on the Subway Sounds channel: dropping from 0.5 to 0.7 cuts 820
 * tags to 534 and removes the ambiguous-duplicate-name noise without losing
 * any geotag or title match.
 */
export const AUTO_TAG_MIN_CONFIDENCE = 0.7;

export async function syncFromYouTube(channelId: string, apiKey: string): Promise<VideoSyncResult> {
  const result: VideoSyncResult = {
    newVideos: 0,
    updatedVideos: 0,
    totalProcessed: 0,
    matchedStations: 0,
    errors: [],
  };

  try {
    const ytVideos = await fetchChannelVideos(channelId, apiKey);

    for (const ytVideo of ytVideos) {
      try {
        const existing = await repo.findByYoutubeId(ytVideo.youtubeId);

        const video = await repo.upsertFromYouTube({
          youtubeId: ytVideo.youtubeId,
          title: ytVideo.title,
          description: ytVideo.description,
          thumbnailUrl: ytVideo.thumbnailUrl,
          channelId,
          channelTitle: ytVideo.channelTitle,
          publishedAt: ytVideo.publishedAt ? new Date(ytVideo.publishedAt) : null,
          duration: ytVideo.duration,
          tags: JSON.stringify(ytVideo.tags),
        });

        if (existing) {
          result.updatedVideos++;
        } else {
          result.newVideos++;
        }

        // Run station matching. Only confident matches become associations:
        // below this, hits are mostly name ambiguity — "Broadway" is two
        // different stations, so every mention tags both, and most of those
        // videos mean the Broadway line or street rather than the G-train stop.
        // The video row is still written either way; it just shows no station.
        const matches = matchVideo({
          title: ytVideo.title,
          tags: ytVideo.tags,
          description: ytVideo.description,
          location: ytVideo.location,
        }).filter((m) => m.confidence >= AUTO_TAG_MIN_CONFIDENCE);

        if (matches.length > 0) {
          await repo.setStationAssociations(
            video.id,
            matches.map((m) => ({
              stationSlug: m.stationSlug,
              matchType: 'AUTO',
              confidence: m.confidence,
            })),
          );
          result.matchedStations += matches.length;
        }

        result.totalProcessed++;
      } catch (err) {
        result.errors.push(`Failed to process ${ytVideo.youtubeId}: ${err}`);
      }
    }
  } catch (err) {
    result.errors.push(`YouTube API error: ${err}`);
  }

  return result;
}

/**
 * Resolve a channel's uploads playlist.
 *
 * Every channel has one; its id is the channel id with the second character
 * switched from C to U, but we ask the API rather than relying on that.
 * Costs 1 unit.
 */
async function fetchUploadsPlaylistId(channelId: string, apiKey: string): Promise<string> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', channelId);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube channels API ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const uploads = json?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error(`No uploads playlist for channel ${channelId}`);
  return uploads;
}

/**
 * Every video on a channel, with the detail the matcher needs.
 *
 * Pages the uploads playlist rather than calling search.list. search.list bills
 * **100 units per page of 50**; playlistItems.list bills 1. On a 1,500-video
 * channel that is the difference between ~3,100 units and ~60 — a third of the
 * default 10,000/day quota versus a rounding error.
 */
async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideoData[]> {
  const videos: YouTubeVideoData[] = [];
  const uploadsPlaylistId = await fetchUploadsPlaylistId(channelId, apiKey);
  let nextPageToken: string | undefined;

  do {
    // Step 1: page the uploads playlist for ids (1 unit)
    const listUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    listUrl.searchParams.set('part', 'contentDetails');
    listUrl.searchParams.set('playlistId', uploadsPlaylistId);
    listUrl.searchParams.set('maxResults', '50');
    listUrl.searchParams.set('key', apiKey);
    if (nextPageToken) listUrl.searchParams.set('pageToken', nextPageToken);

    const listRes = await fetch(listUrl.toString());
    if (!listRes.ok) {
      throw new Error(`YouTube playlistItems API ${listRes.status}: ${await listRes.text()}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listData: any = await listRes.json();

    const videoIds: string[] = (listData.items || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length) {
      // Step 2: full detail for those ids (1 unit).
      // recordingDetails carries the uploader's geotag when they set one — the
      // only location signal YouTube exposes, and most videos have none.
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'snippet,contentDetails,recordingDetails');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('key', apiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      if (!detailsRes.ok) {
        throw new Error(`YouTube videos API ${detailsRes.status}: ${await detailsRes.text()}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detailsData: any = await detailsRes.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of detailsData.items || []) {
        videos.push({
          youtubeId: item.id,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnailUrl:
            item.snippet.thumbnails?.maxres?.url ||
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            '',
          channelTitle: item.snippet.channelTitle || '',
          publishedAt: item.snippet.publishedAt || '',
          duration: item.contentDetails?.duration || null,
          tags: item.snippet.tags || [],
          location: item.recordingDetails?.location
            ? {
                latitude: item.recordingDetails.location.latitude,
                longitude: item.recordingDetails.location.longitude,
              }
            : null,
        });
      }
    }

    nextPageToken = listData.nextPageToken;
  } while (nextPageToken);

  return videos;
}
