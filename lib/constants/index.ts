/**
 * Centralized Constants
 *
 * This file is the single source of truth for all MTA-related constants.
 * Import constants from here to ensure consistency across the codebase.
 */

// =============================================================================
// MTA Official Hex Colors
// =============================================================================

/**
 * Official MTA subway line colors (hex format)
 * Use for MapLibre, Canvas, or any context requiring hex colors
 */
export const MTA_HEX_COLORS: Record<string, string> = {
  // IRT Lines (numbered trains)
  '1': '#EE352E',
  '2': '#EE352E',
  '3': '#EE352E',
  '4': '#00933C',
  '5': '#00933C',
  '6': '#00933C',
  '7': '#B933AD',

  // IND Lines (8th Ave / 6th Ave)
  'A': '#0039A6',
  'C': '#0039A6',
  'E': '#0039A6',
  'B': '#FF6319',
  'D': '#FF6319',
  'F': '#FF6319',
  'M': '#FF6319',
  'G': '#6CBE45',

  // BMT Lines
  'J': '#996633',
  'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A',
  'Q': '#FCCC0A',
  'R': '#FCCC0A',
  'W': '#FCCC0A',

  // Shuttles and SIR
  'S': '#808183',
  'SIR': '#0039A6',
} as const;

// =============================================================================
// MTA Tailwind Colors
// =============================================================================

export interface TailwindLineColor {
  bg: string;
  text: string;
  name: string;
}

/**
 * MTA subway line colors (Tailwind class format)
 * Use for React components with Tailwind CSS
 */
export const MTA_TAILWIND_COLORS: Record<string, TailwindLineColor> = {
  // IRT Lines
  '1': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Local' },
  '2': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Express' },
  '3': { bg: 'bg-red-600', text: 'text-white', name: 'Broadway-7th Ave Express' },
  '4': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Express' },
  '5': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Express' },
  '6': { bg: 'bg-green-500', text: 'text-white', name: 'Lexington Ave Local' },
  '7': { bg: 'bg-purple-600', text: 'text-white', name: 'Flushing Express/Local' },

  // IND/BMT Lines
  'A': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Express' },
  'C': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Local' },
  'E': { bg: 'bg-blue-600', text: 'text-white', name: '8th Ave Local' },
  'B': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Express' },
  'D': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Express' },
  'F': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Local' },
  'M': { bg: 'bg-orange-500', text: 'text-white', name: '6th Ave Local' },
  'N': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Express' },
  'Q': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Express' },
  'R': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Local' },
  'W': { bg: 'bg-yellow-500', text: 'text-black', name: 'Broadway Local' },
  'J': { bg: 'bg-amber-700', text: 'text-white', name: 'Jamaica Line' },
  'Z': { bg: 'bg-amber-700', text: 'text-white', name: 'Jamaica Express' },
  'L': { bg: 'bg-gray-500', text: 'text-white', name: '14th St-Canarsie' },
  'G': { bg: 'bg-lime-500', text: 'text-black', name: 'Brooklyn-Queens Crosstown' },
  'S': { bg: 'bg-gray-600', text: 'text-white', name: 'Shuttle' },
} as const;

// =============================================================================
// MTA GTFS Feed URLs
// =============================================================================

/**
 * MTA real-time GTFS feed URLs
 * Each feed covers specific subway lines
 */
export const MTA_FEED_URLS: Record<string, string> = {
  'ACE': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'BDFM': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'G': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'JZ': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'NQRW': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'L': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  '123456': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
  '7': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-7',
} as const;

/**
 * Mapping of subway lines to their feed identifiers
 */
export const LINE_TO_FEED: Record<string, string> = {
  'A': 'ACE', 'C': 'ACE', 'E': 'ACE',
  'B': 'BDFM', 'D': 'BDFM', 'F': 'BDFM', 'M': 'BDFM',
  'G': 'G',
  'J': 'JZ', 'Z': 'JZ',
  'N': 'NQRW', 'Q': 'NQRW', 'R': 'NQRW', 'W': 'NQRW',
  'L': 'L',
  '1': '123456', '2': '123456', '3': '123456',
  '4': '123456', '5': '123456', '6': '123456',
  '7': '7',
} as const;

// =============================================================================
// Boroughs
// =============================================================================

export const BOROUGHS = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island',
] as const;

export type Borough = (typeof BOROUGHS)[number];

// =============================================================================
// Subway Lines
// =============================================================================

export const ALL_SUBWAY_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z',
] as const;

export type SubwayLine = (typeof ALL_SUBWAY_LINES)[number];

// =============================================================================
// Line Groupings
// =============================================================================

export const LINE_GROUPS = {
  'broadway-7th-ave': { lines: ['1', '2', '3'], name: 'Broadway-7th Avenue', color: '#EE352E' },
  'lexington-ave': { lines: ['4', '5', '6'], name: 'Lexington Avenue', color: '#00933C' },
  'flushing': { lines: ['7'], name: 'Flushing Line', color: '#B933AD' },
  '8th-ave': { lines: ['A', 'C', 'E'], name: '8th Avenue', color: '#0039A6' },
  '6th-ave': { lines: ['B', 'D', 'F', 'M'], name: '6th Avenue', color: '#FF6319' },
  'crosstown': { lines: ['G'], name: 'Brooklyn-Queens Crosstown', color: '#6CBE45' },
  'nassau': { lines: ['J', 'Z'], name: 'Nassau Street', color: '#996633' },
  'canarsie': { lines: ['L'], name: '14th Street-Canarsie', color: '#A7A9AC' },
  'broadway': { lines: ['N', 'Q', 'R', 'W'], name: 'Broadway', color: '#FCCC0A' },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get hex color for a subway line
 * @param line - Subway line identifier (e.g., '1', 'A', 'G')
 * @returns Hex color string
 */
export function getLineHexColor(line: string): string {
  return MTA_HEX_COLORS[line.toUpperCase()] || '#808080';
}

/**
 * Get Tailwind classes for a subway line
 * @param line - Subway line identifier
 * @returns Object with bg, text, and name properties
 */
export function getLineTailwindColor(line: string): TailwindLineColor {
  return MTA_TAILWIND_COLORS[line.toUpperCase()] || {
    bg: 'bg-gray-400',
    text: 'text-white',
    name: 'Unknown Line',
  };
}

/**
 * Get the feed URL for a subway line
 * @param line - Subway line identifier
 * @returns Feed URL string or undefined
 */
export function getFeedUrlForLine(line: string): string | undefined {
  const feedKey = LINE_TO_FEED[line.toUpperCase()];
  return feedKey ? MTA_FEED_URLS[feedKey] : undefined;
}

/**
 * Get all feeds relevant to a set of lines
 * @param lines - Array of subway line identifiers
 * @returns Set of feed keys
 */
export function getRelevantFeeds(lines: string[]): Set<string> {
  const feeds = new Set<string>();
  for (const line of lines) {
    const feed = LINE_TO_FEED[line.toUpperCase()];
    if (feed) feeds.add(feed);
  }
  return feeds;
}

/**
 * Get Tailwind background class for a subway line badge
 * Use this for inline badge styling in components
 * @param line - Subway line identifier
 * @returns Tailwind background class string
 */
export function getLineBgClass(line: string): string {
  const upperLine = line.toUpperCase();

  // IRT numbered lines
  if (['1', '2', '3'].includes(upperLine)) return 'bg-red-600';
  if (['4', '5', '6'].includes(upperLine)) return 'bg-green-500';
  if (upperLine === '7') return 'bg-purple-600';

  // IND 8th Ave
  if (['A', 'C', 'E'].includes(upperLine)) return 'bg-blue-600';

  // IND/BMT 6th Ave
  if (['B', 'D', 'F', 'M'].includes(upperLine)) return 'bg-orange-500';

  // BMT Broadway
  if (['N', 'Q', 'R', 'W'].includes(upperLine)) return 'bg-yellow-500';

  // BMT Nassau
  if (['J', 'Z'].includes(upperLine)) return 'bg-amber-700';

  // Other lines
  if (upperLine === 'L') return 'bg-gray-500';
  if (upperLine === 'G') return 'bg-lime-500';
  if (upperLine === 'S') return 'bg-gray-600';

  return 'bg-gray-400';
}

/**
 * Get Tailwind text color class for a subway line badge
 * @param line - Subway line identifier
 * @returns Tailwind text class string
 */
export function getLineTextClass(line: string): string {
  const upperLine = line.toUpperCase();
  // Yellow lines need dark text for contrast
  if (['N', 'Q', 'R', 'W', 'G'].includes(upperLine)) return 'text-black';
  return 'text-white';
}
