#!/usr/bin/env node
/**
 * Turn scripts/videos-for-labeling.json + data/stations-normalized.json into a
 * trimmed, pre-guessed dataset the labeling artifact inlines.
 *
 * Guessing uses the TITLE only (tags are generic channel-wide noise). Station
 * names are matched on word boundaries. A unique name hit → confident guess; a
 * shared name hit → candidate list for the user to disambiguate; nothing → no
 * guess. Output: scripts/labeler-data.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const { videos } = JSON.parse(
  await readFile(join(__dirname, 'videos-for-labeling.json'), 'utf8'),
);
const stations = JSON.parse(
  await readFile(join(root, 'data', 'stations-normalized.json'), 'utf8'),
);

// Trim stations to what the picker needs.
const stationList = stations.map((s) => ({
  slug: s.slug,
  name: s.name,
  borough: s.borough,
  lines: s.lines || [],
}));

// name -> [slug] (lowercased). Many names map to multiple complexes.
const byName = new Map();
for (const s of stationList) {
  const k = s.name.toLowerCase();
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(s.slug);
}
// Longest names first so "Chambers St" wins over "Chambers" within a title.
const names = [...byName.keys()].filter((n) => n.length >= 4).sort((a, b) => b.length - a.length);

function guessFromTitle(title) {
  const t = ` ${title.toLowerCase()} `;
  for (const name of names) {
    // word-ish boundary: the name is flanked by non-alphanumerics
    const re = new RegExp(`[^a-z0-9]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^a-z0-9]`);
    if (re.test(t)) {
      const slugs = byName.get(name);
      return { candidates: slugs, basis: slugs.length === 1 ? 'title-unique' : 'title-shared', matchedName: name };
    }
  }
  return { candidates: [], basis: 'none', matchedName: null };
}

const out = videos.map((v) => {
  const g = guessFromTitle(v.title);
  return {
    id: v.youtubeId,
    title: v.title,
    tags: v.tags || [],
    thumb: v.thumbnailUrl,
    short: v.durationSeconds > 0 && v.durationSeconds <= 60,
    date: v.publishedAt ? v.publishedAt.slice(0, 10) : null,
    guess: g,
  };
});

const stats = {
  total: out.length,
  unique: out.filter((v) => v.guess.basis === 'title-unique').length,
  shared: out.filter((v) => v.guess.basis === 'title-shared').length,
  none: out.filter((v) => v.guess.basis === 'none').length,
};

await writeFile(
  join(__dirname, 'labeler-data.json'),
  JSON.stringify({ stations: stationList, videos: out, stats }, null, 0),
);
console.log('stats', stats);
console.log('wrote scripts/labeler-data.json');
