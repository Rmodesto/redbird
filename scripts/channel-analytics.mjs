import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token-analytics.json');
const CHANNEL_ID = 'UCteXdWuT-IRRAVCg8ofeZBw';
const CALLBACK_PORT = 8090;

const SCOPES = [
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
];

async function authorize() {
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const creds = raw.installed || raw.web;
  const oauth2 = new OAuth2Client(creds.client_id, creds.client_secret, `http://localhost:${CALLBACK_PORT}`);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2.setCredentials(token);
    if (token.expiry_date && token.expiry_date < Date.now()) {
      const { credentials } = await oauth2.refreshAccessToken();
      oauth2.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
    }
    return oauth2;
  }

  const authUrl = oauth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
  console.log('\nOpen this URL to authorize:\n');
  console.log(authUrl);
  console.log(`\nWaiting on http://localhost:${CALLBACK_PORT} ...\n`);

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url, true);
      if (parsed.query.code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorized!</h1>');
        server.close();
        resolve(parsed.query.code);
      } else { res.writeHead(400); res.end('Missing code'); }
    });
    server.listen(CALLBACK_PORT);
    server.on('error', reject);
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('Token saved.\n');
  return oauth2;
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

const fmt = n => Number(n).toLocaleString();

async function main() {
  console.log('=== Subway Sounds — Channel Analytics ===\n');

  const auth = await authorize();
  const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth });
  const yt = google.youtube({ version: 'v3', auth });

  const today = new Date().toISOString().split('T')[0];
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // ── 1. Channel totals (Analytics API) — 2 calls ──

  console.log('Fetching channel-level stats...\n');

  const [allTimeRes, yearRes] = await Promise.all([
    ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: '2015-01-01',
      endDate: today,
      metrics: 'estimatedMinutesWatched,views,subscribersGained,subscribersLost',
    }),
    ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: oneYearAgo,
      endDate: today,
      metrics: 'estimatedMinutesWatched,views,subscribersGained,subscribersLost',
    }),
  ]);

  const at = allTimeRes.data.rows?.[0] || [0, 0, 0, 0];
  const yr = yearRes.data.rows?.[0] || [0, 0, 0, 0];
  const hrs = mins => (mins / 60).toLocaleString(undefined, { maximumFractionDigits: 1 });

  console.log('┌──────────────────────────────────────────────┐');
  console.log('│          CHANNEL WATCH TIME SUMMARY          │');
  console.log('├──────────────────────────────────────────────┤');
  console.log('│  ALL TIME                                    │');
  console.log(`│    Views:            ${fmt(at[1]).padStart(20)}  │`);
  console.log(`│    Watch time:       ${fmt(at[0]).padStart(14)} min    │`);
  console.log(`│                      ${hrs(at[0]).padStart(14)} hrs    │`);
  console.log(`│    Subs gained:      ${fmt(at[2]).padStart(20)}  │`);
  console.log(`│    Subs lost:        ${fmt(at[3]).padStart(20)}  │`);
  console.log('├──────────────────────────────────────────────┤');
  console.log(`│  LAST 365 DAYS (${oneYearAgo} → ${today})    │`);
  console.log(`│    Views:            ${fmt(yr[1]).padStart(20)}  │`);
  console.log(`│    Watch time:       ${fmt(yr[0]).padStart(14)} min    │`);
  console.log(`│                      ${hrs(yr[0]).padStart(14)} hrs    │`);
  console.log(`│    Subs gained:      ${fmt(yr[2]).padStart(20)}  │`);
  console.log(`│    Subs lost:        ${fmt(yr[3]).padStart(20)}  │`);
  console.log('└──────────────────────────────────────────────┘\n');

  // ── 2. Monthly breakdown (Analytics API) — 1 call ──

  console.log('Monthly breakdown (last 12 months):\n');

  // Align to first of months
  const monthStart = oneYearAgo.substring(0, 8) + '01';
  // End on first of current month
  const now = new Date();
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const monthRes = await ytAnalytics.reports.query({
    ids: 'channel==MINE',
    startDate: monthStart,
    endDate: monthEnd,
    dimensions: 'month',
    metrics: 'views,estimatedMinutesWatched',
    sort: 'month',
  });

  if (monthRes.data.rows?.length) {
    console.log('  Month   |     Views |  Watch Hrs');
    console.log('  --------|-----------|----------');
    for (const r of monthRes.data.rows) {
      console.log(`  ${r[0]}  | ${fmt(r[1]).padStart(9)} | ${hrs(r[2]).padStart(9)}`);
    }
  }

  // ── 3. All videos with lifetime view counts (Data API) ──
  // Uses playlistItems + videos.list — no analytics quota cost

  console.log('\n\nFetching all video view counts (lifetime)...\n');

  // Get uploads playlist
  const chRes = await yt.channels.list({ part: ['contentDetails'], id: [CHANNEL_ID] });
  const uploadsId = chRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  // Get all video IDs
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
    process.stdout.write(`  ${videoIds.length} videos indexed...\r`);
  } while (pageToken);
  console.log(`  ${videoIds.length} videos indexed.      \n`);

  // Get details + stats in batches of 50
  const allVideos = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: batch,
    });
    for (const item of res.data.items || []) {
      allVideos.push({
        id: item.id,
        title: item.snippet?.title || '',
        duration: parseDuration(item.contentDetails?.duration || ''),
        views: parseInt(item.statistics?.viewCount || '0'),
        likes: parseInt(item.statistics?.likeCount || '0'),
      });
    }
  }

  // Videos with < 100 lifetime views
  const lowViews = allVideos.filter(v => v.views < 100).sort((a, b) => a.views - b.views);
  const shorts = allVideos.filter(v => v.duration <= 60);
  const longForm = allVideos.filter(v => v.duration > 60);

  console.log(`Total videos:       ${allVideos.length}`);
  console.log(`Shorts (<= 60s):    ${shorts.length}`);
  console.log(`Long-form (> 60s):  ${longForm.length}`);
  console.log(`\nVideos with < 100 views (lifetime): ${lowViews.length}\n`);

  if (lowViews.length > 0) {
    for (const v of lowViews) {
      const type = v.duration <= 60 ? 'Short' : v.duration > 3600 ? 'Long ' : 'Vid  ';
      console.log(`  [${type}] ${v.views.toString().padStart(3)} views | ${v.title}`);
    }
  }

  // Top 10
  const top10 = [...allVideos].sort((a, b) => b.views - a.views).slice(0, 10);
  console.log('\n  TOP 10 (lifetime views):');
  for (const v of top10) {
    console.log(`  ${fmt(v.views).padStart(10)} views | ${v.title}`);
  }

  // Save
  const outputPath = path.join(__dirname, 'channel-analytics.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    channel: {
      allTime: { views: at[1], watchMinutes: at[0], watchHours: +(at[0] / 60).toFixed(1), subsGained: at[2], subsLost: at[3] },
      last365: { views: yr[1], watchMinutes: yr[0], watchHours: +(yr[0] / 60).toFixed(1), subsGained: yr[2], subsLost: yr[3] },
    },
    totalVideos: allVideos.length,
    totalShorts: shorts.length,
    videosUnder100Views: lowViews.length,
    lowViewVideos: lowViews,
    top10: top10,
  }, null, 2));
  console.log(`\nFull data saved to scripts/channel-analytics.json`);
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
