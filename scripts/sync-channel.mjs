/**
 * Run the YouTube sync for a channel against the database in .env.local.
 *
 *   node scripts/sync-channel.mjs [channelId]
 *
 * Writes Video rows for every upload and VideoStation associations for matches
 * at or above the confidence floor in lib/video/video.service.ts. Idempotent —
 * upserts by youtubeId, so re-running updates rather than duplicating.
 *
 * Quota: 1 unit for the channel lookup, then 2 per 50 videos.
 */
import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
config({ quiet: true });

import { build } from '../.ds-sync/node_modules/esbuild/lib/main.js';
import { writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const CHANNEL = process.argv[2] || 'UCteXdWuT-IRRAVCg8ofeZBw';

if (!process.env.YOUTUBE_API_KEY) {
  console.error('YOUTUBE_API_KEY not set');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const host = (process.env.DATABASE_URL.match(/@([^/]+)\//) || [])[1] || '(unknown)';
console.log(`channel  ${CHANNEL}`);
console.log(`database ${host}`);
console.log('');

// The service is TypeScript with @/ aliases — bundle it to run it here.
// Written to a real file rather than a data: URL — bare specifiers like
// @prisma/client have no base path to resolve from inside a data URL.
const tmp = 'scripts/.sync-bundle.mjs';
await build({
  entryPoints: ['lib/video/video.service.ts'],
  bundle: true,
  outfile: tmp,
  format: 'esm',
  platform: 'node',
  absWorkingDir: process.cwd(),
  tsconfig: 'tsconfig.json',
  packages: 'external',
  logLevel: 'silent',
});
const svc = await import(pathToFileURL(tmp).href);
const cleanup = () => { try { rmSync(tmp); } catch {} };
process.on('exit', cleanup);

console.log(`confidence floor for station tags: ${svc.AUTO_TAG_MIN_CONFIDENCE}`);
console.log('syncing…\n');

const t0 = Date.now();
const result = await svc.syncFromYouTube(CHANNEL, process.env.YOUTUBE_API_KEY);
const secs = ((Date.now() - t0) / 1000).toFixed(1);

console.log('═══ SYNC COMPLETE ═══');
console.log(`  processed       ${result.totalProcessed.toLocaleString()}`);
console.log(`  new videos      ${result.newVideos.toLocaleString()}`);
console.log(`  updated         ${result.updatedVideos.toLocaleString()}`);
console.log(`  station tags    ${result.matchedStations.toLocaleString()}`);
console.log(`  elapsed         ${secs}s`);

if (result.errors.length) {
  console.log(`\n  errors (${result.errors.length}):`);
  for (const e of result.errors.slice(0, 10)) console.log(`    · ${e}`);
  if (result.errors.length > 10) console.log(`    … and ${result.errors.length - 10} more`);
}
process.exit(0);
