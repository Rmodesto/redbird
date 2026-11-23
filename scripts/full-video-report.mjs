import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token-analytics.json');
const OUTPUT_PATH = path.join(__dirname, 'full-video-report.json');
const CHANNEL_ID = 'UCteXdWuT-IRRAVCg8ofeZBw';

function getAuth() {
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const creds = raw.installed || raw.web;
  const oauth2 = new OAuth2Client(creds.client_id, creds.client_secret, 'http://localhost:8090');
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2.setCredentials(token);
  return oauth2;
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

async function main() {
  console.log('=== Full Video Report ===\n');

  const auth = getAuth();
  const yt = google.youtube({ version: 'v3', auth });
  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth });

  const today = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // ── Step 1: Get all video IDs via uploads playlist ──
  console.log('Fetching all video IDs...');
  const chRes = await yt.channels.list({ part: ['contentDetails'], id: [CHANNEL_ID] });
  const uploadsId = chRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  const videoIds = [];
  let pageToken;
  do {
    const res = await yt.playlistItems.list({
      part: ['contentDetails'],
      playlistId: uploadsId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items || []) {
      if (item.contentDetails?.videoId) videoIds.push(item.contentDetails.videoId);
    }
    pageToken = res.data.nextPageToken || undefined;
    process.stdout.write(`  ${videoIds.length} videos...\r`);
  } while (pageToken);
  console.log(`  ${videoIds.length} videos found.\n`);

  // ── Step 2: Get snippet + statistics for all videos (Data API) ──
  console.log('Fetching video details + stats...');
  const videoMap = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: batch,
    });
    for (const item of res.data.items || []) {
      videoMap[item.id] = {
        id: item.id,
        title: item.snippet?.title || '',
        publishedAt: item.snippet?.publishedAt || '',
        duration: parseDuration(item.contentDetails?.duration || ''),
        lifetimeViews: parseInt(item.statistics?.viewCount || '0'),
        lifetimeLikes: parseInt(item.statistics?.likeCount || '0'),
        lifetimeComments: parseInt(item.statistics?.commentCount || '0'),
        // Will be filled by analytics
        yearViews: 0,
        yearWatchMins: 0,
        yearSubsGained: 0,
        yearSubsLost: 0,
      };
    }
    process.stdout.write(`  ${Math.min(i + 50, videoIds.length)}/${videoIds.length} details...\r`);
  }
  console.log(`  ${Object.keys(videoMap).length} video details loaded.\n`);

  // ── Step 3: Per-video analytics (last 365 days) via batched filters ──
  // Analytics API filter supports ~200 video IDs per query
  console.log('Fetching per-video analytics (last 365 days)...');

  const ids = Object.keys(videoMap);
  const BATCH_SIZE = 100; // safe batch size for filters
  let analyticsCount = 0;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const filterStr = 'video==' + batch.join(',');

    try {
      const res = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: oneYearAgo,
        endDate: today,
        filters: filterStr,
        dimensions: 'video',
        metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost',
        maxResults: BATCH_SIZE,
        sort: '-views',
      });

      for (const row of res.data.rows || []) {
        const vid = row[0];
        if (videoMap[vid]) {
          videoMap[vid].yearViews = row[1];
          videoMap[vid].yearWatchMins = row[2];
          videoMap[vid].yearSubsGained = row[3];
          videoMap[vid].yearSubsLost = row[4];
          analyticsCount++;
        }
      }
    } catch (err) {
      console.error(`\n  Analytics batch ${i}-${i + BATCH_SIZE} failed: ${err.message}`);
      // If quota hit, stop analytics and keep what we have
      if (/quota/i.test(err.message)) {
        console.log('  Quota hit — using Data API stats for remaining videos.');
        break;
      }
    }

    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, ids.length)}/${ids.length} analyzed...\r`);
  }
  console.log(`  ${analyticsCount} videos with analytics data.\n`);

  // ── Step 4: Build sorted report ──
  const allVideos = Object.values(videoMap).sort((a, b) => b.lifetimeViews - a.lifetimeViews);

  // Summary stats
  const totalLifetimeViews = allVideos.reduce((s, v) => s + v.lifetimeViews, 0);
  const totalYearViews = allVideos.reduce((s, v) => s + v.yearViews, 0);
  const totalYearWatchMins = allVideos.reduce((s, v) => s + v.yearWatchMins, 0);
  const totalYearSubsGained = allVideos.reduce((s, v) => s + v.yearSubsGained, 0);
  const shorts = allVideos.filter(v => v.duration <= 60);
  const longForm = allVideos.filter(v => v.duration > 60);
  const under100 = allVideos.filter(v => v.lifetimeViews < 100);

  console.log('┌────────────────────────────────────┐');
  console.log('│         VIDEO REPORT SUMMARY       │');
  console.log('├────────────────────────────────────┤');
  console.log(`│  Total videos:    ${allVideos.length.toString().padStart(14)}  │`);
  console.log(`│  Shorts:          ${shorts.length.toString().padStart(14)}  │`);
  console.log(`│  Long-form:       ${longForm.length.toString().padStart(14)}  │`);
  console.log(`│  Under 100 views: ${under100.length.toString().padStart(14)}  │`);
  console.log('├────────────────────────────────────┤');
  console.log(`│  Lifetime views:  ${totalLifetimeViews.toLocaleString().padStart(14)}  │`);
  console.log(`│  Year views:      ${totalYearViews.toLocaleString().padStart(14)}  │`);
  console.log(`│  Year watch hrs:  ${(totalYearWatchMins / 60).toFixed(1).padStart(14)}  │`);
  console.log(`│  Year subs gained:${totalYearSubsGained.toLocaleString().padStart(14)}  │`);
  console.log('└────────────────────────────────────┘\n');

  // Print top 20
  console.log('TOP 20 VIDEOS:');
  for (const v of allVideos.slice(0, 20)) {
    const type = v.duration <= 60 ? 'S' : v.duration > 3600 ? 'L' : 'V';
    console.log(`  [${type}] ${v.lifetimeViews.toLocaleString().padStart(8)} views | ${v.yearViews.toLocaleString().padStart(7)} yr | ${v.yearWatchMins.toFixed(0).padStart(6)} min | +${v.yearSubsGained} subs | ${v.title}`);
  }

  // Save full report
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    summary: {
      totalVideos: allVideos.length,
      totalShorts: shorts.length,
      totalLongForm: longForm.length,
      videosUnder100Views: under100.length,
      lifetimeViews: totalLifetimeViews,
      yearViews: totalYearViews,
      yearWatchHours: +(totalYearWatchMins / 60).toFixed(1),
      yearSubsGained: totalYearSubsGained,
    },
    videos: allVideos,
  }, null, 2));

  console.log(`\nFull report saved to scripts/full-video-report.json (${allVideos.length} videos)`);
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
