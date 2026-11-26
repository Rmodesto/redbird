import stationsData from '@/data/stations-normalized.json';

/**
 * Number of normalized MTA station complexes in data/stations-normalized.json —
 * the single source of truth for any "N stations" figure on the site.
 *
 * This counts complexes (stations sharing a transfer are merged into one), which
 * is why it is 445 and not the ~472 platform-level figure some older copy used.
 */
export const STATION_COUNT = (stationsData as unknown[]).length;
