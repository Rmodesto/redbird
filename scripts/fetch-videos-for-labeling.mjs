#!/usr/bin/env node
/**
 * Fetch the full @SubwaySounds video list for the station-labeling QA tool.
 *
 * Pages the channel's uploads playlist (1 quota unit per page of 50) and pulls
 * snippet/contentDetails/recordingDetails for each video, then writes
 * scripts/videos-for-labeling.json. Pure fetch — no DB, no station matching;
 * the labeling artifact computes auto-guesses client-side from the same data.
 *
 * Usage:
 *   YOUTUBE_API_KEY=xxxx node scripts/fetch-videos-for-labeling.mjs
 *   # optional: YT_CHANNEL_ID=UC... to skip handle resolution
 *   # optional: YT_HANDLE=@SubwaySounds (default)
 *
 * Quota: ~2 units per 50 videos + 1 for channel resolution. ~1,350 videos ≈ 55
 * units, well under the default 10,000/day.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API_KEY = process.env.YOUTUBE_API_KEY;
const HANDLE = process.env.YT_HANDLE || '@SubwaySounds';
const CHANNEL_ID = process.env.YT_CHANNEL_ID || '';

if (!API_KEY) {
  console.error('Missing YOUTUBE_API_KEY. Run: YOUTUBE_API_KEY=xxxx node scripts/fetch-videos-for-labeling.mjs');
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'videos-for-labeling.json');

async function getJson(url) {
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube API ${res.status} on ${url.pathname}: ${await res.text()}`);
  }
  return res.json();
}

async function resolveChannelId() {
  if (CHANNEL_ID) return CHANNEL_ID;
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id');
  url.searchParams.set('forHandle', HANDLE.replace(/^@/, ''));
  url.searchParams.set('key', API_KEY);
  const json = await getJson(url);
  const id = json?.items?.[0]?.id;
  if (!id) throw new Error(`Could not resolve channel for handle ${HANDLE}. Set YT_CHANNEL_ID explicitly.`);
  return id;
}

async function getUploadsPlaylistId(channelId) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', channelId);
  url.searchParams.set('key', API_KEY);
  const json = await getJson(url);
  const uploads = json?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error(`No uploads playlist for channel ${channelId}`);
  return uploads;
}

/** ISO 8601 duration → whole seconds (0 if unparseable). */
function durationSeconds(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

async function main() {
  const channelId = await resolveChannelId();
  const uploads = await getUploadsPlaylistId(channelId);
  console.log(`Channel ${channelId} · uploads playlist ${uploads}`);

  const videos = [];
  let pageToken;
  let pages = 0;

  do {
    const listUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    listUrl.searchParams.set('part', 'contentDetails');
    listUrl.searchParams.set('playlistId', uploads);
    listUrl.searchParams.set('maxResults', '50');
    listUrl.searchParams.set('key', API_KEY);
    if (pageToken) listUrl.searchParams.set('pageToken', pageToken);

    const listData = await getJson(listUrl);
    const ids = (listData.items || [])
      .map((i) => i.contentDetails?.videoId)
      .filter(Boolean);

    if (ids.length) {
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'snippet,contentDetails,recordingDetails');
      detailsUrl.searchParams.set('id', ids.join(','));
      detailsUrl.searchParams.set('key', API_KEY);
      const detailsData = await getJson(detailsUrl);

      for (const item of detailsData.items || []) {
        const duration = item.contentDetails?.duration || null;
        videos.push({
          youtubeId: item.id,
          title: item.snippet?.title || '',
          description: item.snippet?.description || '',
          tags: item.snippet?.tags || [],
          publishedAt: item.snippet?.publishedAt || null,
          thumbnailUrl:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            '',
          duration,
          durationSeconds: durationSeconds(duration),
          location: item.recordingDetails?.location
            ? {
                latitude: item.recordingDetails.location.latitude,
                longitude: item.recordingDetails.location.longitude,
              }
            : null,
        });
      }
    }

    pageToken = listData.nextPageToken;
    pages += 1;
    process.stdout.write(`\rFetched ${videos.length} videos (${pages} pages)…`);
  } while (pageToken);

  process.stdout.write('\n');
  videos.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  await writeFile(
    OUT,
    JSON.stringify({ channelId, handle: HANDLE, fetchedCount: videos.length, videos }, null, 2),
  );
  console.log(`Wrote ${videos.length} videos → ${OUT}`);
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
