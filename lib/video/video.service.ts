import * as repo from './video.repository';
import { matchVideoToStations } from './station-matcher';

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
  stations: { stationSlug: string; matchType: string; confidence: number }[];
  createdAt: string;
  updatedAt: string;
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
    stations: video.stations.map((s) => ({
      stationSlug: s.stationSlug,
      matchType: s.matchType,
      confidence: s.confidence,
    })),
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
): Promise<VideoListResponse> {
  const { videos, total } = await repo.findMany({ page, limit, status, search });
  return {
    videos: videos.map(toApiVideo),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
}

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

        // Run station matching
        const matches = matchVideoToStations(ytVideo.title, ytVideo.tags);
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

async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YouTubeVideoData[]> {
  const videos: YouTubeVideoData[] = [];
  let nextPageToken: string | undefined;

  do {
    // Step 1: Search for channel videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('channelId', channelId);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'date');
    searchUrl.searchParams.set('maxResults', '50');
    searchUrl.searchParams.set('key', apiKey);
    if (nextPageToken) searchUrl.searchParams.set('pageToken', nextPageToken);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      const body = await searchRes.text();
      throw new Error(`YouTube search API ${searchRes.status}: ${body}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchData: any = await searchRes.json();

    const videoIds = searchData.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((item: any) => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds?.length) {
      // Step 2: Fetch full video details
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'snippet,contentDetails');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('key', apiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      if (!detailsRes.ok) {
        const body = await detailsRes.text();
        throw new Error(`YouTube videos API ${detailsRes.status}: ${body}`);
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
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            '',
          channelTitle: item.snippet.channelTitle || '',
          publishedAt: item.snippet.publishedAt || '',
          duration: item.contentDetails?.duration || null,
          tags: item.snippet.tags || [],
        });
      }
    }

    nextPageToken = searchData.nextPageToken;
  } while (nextPageToken);

  return videos;
}
