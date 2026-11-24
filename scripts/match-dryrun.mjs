/**
 * Dry run: fetch a channel's uploads, run the station matcher over them, and
 * report what WOULD be tagged. Writes nothing to the database.
 *
 *   node scripts/match-dryrun.mjs                 # default channel
 *   node scripts/match-dryrun.mjs <channelId>
 *
 * Quota: 1 unit for the channel lookup, then 2 per 50 videos.
 */
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
config({ quiet: true });
import { build } from '../.ds-sync/node_modules/esbuild/lib/main.js';
import { writeFileSync } from 'node:fs';

const CHANNEL = process.argv[2] || 'UCteXdWuT-IRRAVCg8ofeZBw';
const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error('YOUTUBE_API_KEY not set');
  process.exit(1);
}

// The matcher is TypeScript with @/ aliases — bundle it to run it here.
const bundled = await build({
  entryPoints: ['lib/video/station-matcher.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  absWorkingDir: process.cwd(),
  tsconfig: 'tsconfig.json',
  logLevel: 'silent',
});
const { matchVideo } = await import(
  'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64')
);

const api = async (path, params) => {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', KEY);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return res.json();
};

let units = 0;

const ch = await api('channels', { part: 'contentDetails', id: CHANNEL });
units += 1;
const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
if (!uploads) {
  console.error('no uploads playlist for', CHANNEL);
  process.exit(1);
}

const videos = [];
let token;
process.stderr.write('fetching');
do {
  const page = await api('playlistItems', {
    part: 'contentDetails',
    playlistId: uploads,
    maxResults: '50',
    ...(token ? { pageToken: token } : {}),
  });
  units += 1;
  const ids = (page.items || []).map((i) => i.contentDetails?.videoId).filter(Boolean);
  if (ids.length) {
    const det = await api('videos', {
      part: 'snippet,contentDetails,recordingDetails',
      id: ids.join(','),
    });
    units += 1;
    for (const it of det.items || []) {
      videos.push({
        youtubeId: it.id,
        title: it.snippet.title,
        description: it.snippet.description || '',
        tags: it.snippet.tags || [],
        duration: it.contentDetails?.duration || null,
        location: it.recordingDetails?.location
          ? {
              latitude: it.recordingDetails.location.latitude,
              longitude: it.recordingDetails.location.longitude,
            }
          : null,
      });
    }
  }
  token = page.nextPageToken;
  process.stderr.write('.');
} while (token);
process.stderr.write('\n\n');

// ── Match ───────────────────────────────────────────────────────────────
let matched = 0,
  unmatched = 0,
  geotagged = 0,
  totalTags = 0;
const byStation = new Map();
const byConfidence = { '0.90+': 0, '0.80-0.89': 0, '0.70-0.79': 0, '0.50-0.69': 0 };
const unmatchedSamples = [];
const detail = [];

for (const v of videos) {
  if (v.location) geotagged++;
  const res = matchVideo({
    title: v.title,
    tags: v.tags,
    description: v.description,
    location: v.location,
  });
  if (!res.length) {
    unmatched++;
    if (unmatchedSamples.length < 15) unmatchedSamples.push(v.title);
    detail.push({ id: v.youtubeId, title: v.title, duration: v.duration, matches: [] });
    continue;
  }
  matched++;
  totalTags += res.length;
  detail.push({
    id: v.youtubeId,
    title: v.title,
    duration: v.duration,
    geotagged: !!v.location,
    matches: res.map((m) => ({ slug: m.stationSlug, name: m.stationName, confidence: Number(m.confidence.toFixed(3)) })),
  });
  for (const m of res) {
    byStation.set(m.stationName, (byStation.get(m.stationName) || 0) + 1);
    const c = m.confidence;
    if (c >= 0.9) byConfidence['0.90+']++;
    else if (c >= 0.8) byConfidence['0.80-0.89']++;
    else if (c >= 0.7) byConfidence['0.70-0.79']++;
    else byConfidence['0.50-0.69']++;
  }
}

const pct = (n) => `${((n / videos.length) * 100).toFixed(1)}%`;

console.log('═══ DRY RUN — nothing written ═══\n');
console.log(`channel          ${CHANNEL}`);
console.log(`videos fetched   ${videos.length.toLocaleString()}`);
console.log(`quota used       ${units} units (search.list would have cost ~${videos.length / 50 * 100 | 0})`);
console.log('');
console.log(`matched          ${matched.toLocaleString()}  (${pct(matched)})`);
console.log(`unmatched        ${unmatched.toLocaleString()}  (${pct(unmatched)})`);
console.log(`geotagged        ${geotagged.toLocaleString()}  (${pct(geotagged)})`);
console.log(`station tags     ${totalTags.toLocaleString()} total, ${(totalTags / (matched || 1)).toFixed(1)} per matched video`);
console.log(`distinct stations ${byStation.size} of 445`);
console.log('');
console.log('confidence spread (per tag):');
for (const [k, n] of Object.entries(byConfidence)) {
  console.log(`  ${k.padEnd(10)} ${String(n).padStart(6)}`);
}
console.log('');
console.log('top 15 stations by tag count:');
for (const [name, n] of [...byStation.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${name}`);
}
console.log('');
console.log('sample unmatched titles:');
for (const t of unmatchedSamples) console.log(`  · ${t.slice(0, 90)}`);

writeFileSync(
  'scripts/match-dryrun.json',
  JSON.stringify(
    { channel: CHANNEL, videos: videos.length, matched, unmatched, geotagged, totalTags, byConfidence, stations: Object.fromEntries(byStation), detail },
    null,
    2
  )
);
console.log('\nfull report → scripts/match-dryrun.json');
