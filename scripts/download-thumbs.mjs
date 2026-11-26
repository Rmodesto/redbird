#!/usr/bin/env node
/**
 * Download thumbnails for the review-queue videos (those with a station guess)
 * so the labeling artifact can show play-posters from its own origin — the
 * artifact CSP blocks remote images (i.ytimg.com), but same-origin files load.
 *
 * Writes <outDir>/<youtubeId>.jpg and marks each downloaded video `tl:1` in
 * scripts/labeler-data.json. Capped at 255 (the artifact supporting-file limit).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.argv[2] || join(__dirname, 'thumbs');
const DATA = join(__dirname, 'labeler-data.json');
const CAP = 255;

const data = JSON.parse(await readFile(DATA, 'utf8'));
await mkdir(OUT_DIR, { recursive: true });

const queue = data.videos.filter((v) => v.guess && v.guess.basis !== 'none').slice(0, CAP);
console.log(`Downloading ${queue.length} thumbnails → ${OUT_DIR}`);

let ok = 0, fail = 0;
const okIds = new Set();
for (const v of queue) {
  // Prefer the medium (320x180) thumbnail; fall back to the stored url's host.
  const candidates = [
    `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`,
    v.thumb,
    `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
  ].filter(Boolean);
  let saved = false;
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) continue; // yt returns a tiny placeholder for missing sizes
      await writeFile(join(OUT_DIR, `${v.id}.jpg`), buf);
      saved = true;
      break;
    } catch { /* try next */ }
  }
  if (saved) { ok++; okIds.add(v.id); } else { fail++; }
  process.stdout.write(`\r${ok} ok, ${fail} failed…`);
}
process.stdout.write('\n');

for (const v of data.videos) v.tl = okIds.has(v.id) ? 1 : 0;
await writeFile(DATA, JSON.stringify(data, null, 0));
console.log(`Marked ${ok} videos tl:1 in labeler-data.json`);
