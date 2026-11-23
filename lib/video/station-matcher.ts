import { mtaDataService } from '@/lib/services/mta-data-service';

interface MatchResult {
  stationSlug: string;
  stationName: string;
  confidence: number;
}

// Maps avenue/street names to the lines that run on them
const AVENUE_LINE_MAP: Record<string, string[]> = {
  'lexington': ['4', '5', '6'],
  'lex': ['4', '5', '6'],
  '7th ave': ['1', '2', '3'],
  'seventh ave': ['1', '2', '3'],
  'broadway': ['1', '2', '3', 'N', 'Q', 'R', 'W'],
  '8th ave': ['A', 'C', 'E'],
  'eighth ave': ['A', 'C', 'E'],
  '6th ave': ['B', 'D', 'F', 'M'],
  'sixth ave': ['B', 'D', 'F', 'M'],
  'avenue of the americas': ['B', 'D', 'F', 'M'],
  'nassau': ['J', 'Z'],
  'canarsie': ['L'],
  '14th st': ['L'],
  'crosstown': ['G'],
  'flushing': ['7'],
  'brighton': ['B', 'Q'],
  'culver': ['F', 'G'],
  'concourse': ['B', 'D'],
  'pelham': ['6'],
  'white plains': ['2', '5'],
  'new lots': ['3', 'L'],
  'nostrand': ['A', 'C', '3'],
  'eastern pkwy': ['2', '3', '4', '5'],
  '4th ave': ['D', 'N', 'R'],
  'fourth ave': ['D', 'N', 'R'],
  'sea beach': ['N'],
  'west end': ['D'],
  'queens blvd': ['E', 'F', 'M', 'R'],
};

/**
 * Match a video title to stations from the normalized data.
 *
 * Strategy (in priority order):
 * 1. Exact unique name match → 0.95
 * 2. Duplicate name + line identifier in title → 0.90
 * 3. Duplicate name + avenue context → 0.85
 * 4. Normalized name match → 0.80
 * 5. Duplicate name, no disambiguator → 0.50 for all matching stations
 */
export function matchVideoToStations(
  videoTitle: string,
  videoTags: string[] = [],
): MatchResult[] {
  const stations = mtaDataService.getAllStations();
  const combinedText = [videoTitle, ...videoTags].join(' ').toLowerCase();
  const results: MatchResult[] = [];

  // Build name → stations lookup
  const nameMap = new Map<string, typeof stations>();
  for (const station of stations) {
    const key = station.name.toLowerCase();
    if (!nameMap.has(key)) nameMap.set(key, []);
    nameMap.get(key)!.push(station);
  }

  // Check each unique station name for a match in the title
  for (const [nameLower, stationsWithName] of Array.from(nameMap.entries())) {
    if (!combinedText.includes(nameLower)) continue;

    const isUnique = stationsWithName.length === 1;

    if (isUnique) {
      // Strategy 1: unique name match
      results.push({
        stationSlug: stationsWithName[0].slug,
        stationName: stationsWithName[0].name,
        confidence: 0.95,
      });
    } else {
      // Multiple stations share this name — try to disambiguate
      let disambiguated = false;

      for (const station of stationsWithName) {
        // Strategy 2: look for line identifiers
        const hasLineMatch = station.lines.some((line) => {
          const l = line.toLowerCase();
          return (
            combinedText.includes(` ${l} train`) ||
            combinedText.includes(` ${l} line`) ||
            combinedText.includes(`(${l})`) ||
            combinedText.includes(`/${l}/`) ||
            combinedText.includes(`${l}/${station.lines.join('/').toLowerCase()}`)
          );
        });

        if (hasLineMatch) {
          results.push({
            stationSlug: station.slug,
            stationName: station.name,
            confidence: 0.90,
          });
          disambiguated = true;
          continue;
        }

        // Strategy 3: avenue context
        for (const [aveName, aveLines] of Object.entries(AVENUE_LINE_MAP)) {
          if (!combinedText.includes(aveName)) continue;
          const stationHasAveLine = station.lines.some((l) => aveLines.includes(l));
          if (stationHasAveLine) {
            results.push({
              stationSlug: station.slug,
              stationName: station.name,
              confidence: 0.85,
            });
            disambiguated = true;
            break;
          }
        }
      }

      // Strategy 5: no disambiguator found — match all at low confidence
      if (!disambiguated) {
        for (const station of stationsWithName) {
          results.push({
            stationSlug: station.slug,
            stationName: station.name,
            confidence: 0.50,
          });
        }
      }
    }
  }

  // Also try normalized matching for stations not yet matched
  const matchedSlugs = new Set(results.map((r) => r.stationSlug));
  for (const station of stations) {
    if (matchedSlugs.has(station.slug)) continue;

    const normalizedName = normalizeStationName(station.name);
    if (normalizedName.length > 3 && combinedText.includes(normalizedName)) {
      results.push({
        stationSlug: station.slug,
        stationName: station.name,
        confidence: 0.80,
      });
    }
  }

  // Deduplicate: keep highest confidence per slug
  const deduped = new Map<string, MatchResult>();
  for (const r of results) {
    const existing = deduped.get(r.stationSlug);
    if (!existing || r.confidence > existing.confidence) {
      deduped.set(r.stationSlug, r);
    }
  }

  return Array.from(deduped.values())
    .filter((r) => r.confidence >= 0.50)
    .sort((a, b) => b.confidence - a.confidence);
}

function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/\b(st|av|ave|blvd|pkwy|rd|hwy|sq|pl)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
