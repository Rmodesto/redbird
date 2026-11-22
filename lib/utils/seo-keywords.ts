/**
 * SEO Keywords Utility
 *
 * Helper functions to access and use SEO keywords from the centralized
 * seo-keywords.json configuration file.
 */

import seoKeywordsData from '@/data/seo-keywords.json';

export interface Station {
  name: string;
  slug: string;
  lines: string[];
  borough: string;
  ada: boolean;
}

/**
 * Get keywords for a specific station page section
 */
export function getKeywordsForSection(sectionName: keyof typeof seoKeywordsData.stationPageSections) {
  return seoKeywordsData.stationPageSections[sectionName];
}

/**
 * Get keywords by category
 */
export function getKeywordsByCategory(category: keyof typeof seoKeywordsData.keywordCategories) {
  return seoKeywordsData.keywordCategories[category];
}

/**
 * Get high priority keywords
 */
export function getHighPriorityKeywords() {
  return seoKeywordsData.highPriorityKeywords;
}

/**
 * Get hashtags for a category
 */
export function getHashtags(category?: keyof typeof seoKeywordsData.hashtags.byCategory) {
  if (category) {
    return seoKeywordsData.hashtags.byCategory[category];
  }
  return seoKeywordsData.hashtags.global;
}

/**
 * Replace placeholders in keywords with station-specific data
 *
 * Placeholders:
 * - {station} => station name
 * - {line} => first line serving the station
 * - {lines} => all lines serving the station
 * - {borough} => borough name
 */
export function replaceStationPlaceholders(
  keywords: string[],
  station: Station
): string[] {
  return keywords.map(keyword =>
    keyword
      .replace(/{station}/g, station.name)
      .replace(/{line}/g, station.lines[0] || '')
      .replace(/{lines}/g, station.lines.join(', '))
      .replace(/{borough}/g, station.borough)
  );
}

/**
 * Get all keywords for a station page (combines multiple sections)
 */
export function getAllStationKeywords(station: Station): string[] {
  const sections = [
    'liveArrivals',
    'accessibility',
    'safety',
    'sounds',
    'location',
    'stationInfo'
  ] as const;

  const allKeywords: string[] = [];

  sections.forEach(section => {
    const sectionData = getKeywordsForSection(section);
    allKeywords.push(...sectionData.primary);
    allKeywords.push(...replaceStationPlaceholders(sectionData.longTail, station));
  });

  return Array.from(new Set(allKeywords)); // Remove duplicates
}

/**
 * Get aria-label for a section with station data filled in
 */
export function getAriaLabel(
  sectionName: keyof typeof seoKeywordsData.stationPageSections,
  station?: Station
): string {
  const section = getKeywordsForSection(sectionName);
  let ariaLabel = section.ariaLabel;

  if (station) {
    ariaLabel = ariaLabel
      .replace(/{station}/g, station.name)
      .replace(/{line}/g, station.lines[0] || '')
      .replace(/{lines}/g, station.lines.join(', '))
      .replace(/{borough}/g, station.borough);
  }

  return ariaLabel;
}

/**
 * Get description for a section with station data filled in
 */
export function getDescription(
  sectionName: keyof typeof seoKeywordsData.stationPageSections,
  station: Station
): string {
  const section = getKeywordsForSection(sectionName);
  return section.description
    .replace(/{station}/g, station.name)
    .replace(/{line}/g, station.lines[0] || '')
    .replace(/{lines}/g, station.lines.join(', '))
    .replace(/{borough}/g, station.borough);
}

/**
 * Get metadata keywords for a station page
 * Combines high-priority keywords with station-specific keywords
 */
export function getMetadataKeywords(station: Station): string[] {
  const highPriority = getHighPriorityKeywords()
    .slice(0, 10)
    .map(k => k.phrase);

  const stationSpecific = [
    `${station.name} station`,
    `${station.name} subway`,
    `${station.borough} subway`,
    ...station.lines.map(line => `${line} train`),
    ...station.lines.map(line => `${line} train stations`),
  ];

  // Add category keywords
  const realTimeKeywords = getKeywordsByCategory('realTime').keywords.slice(0, 5);
  const safetyKeywords = getKeywordsByCategory('safety').keywords.slice(0, 3);

  return [
    ...stationSpecific,
    ...highPriority,
    ...realTimeKeywords,
    ...safetyKeywords,
  ];
}

/**
 * Get common voice search queries for a station
 */
export function getVoiceSearchQueries(station: Station): string[] {
  return replaceStationPlaceholders(
    seoKeywordsData.commonQueries.voice,
    station
  );
}

/**
 * Get question-based queries for FAQ schema
 */
export function getQuestionKeywords(station?: Station): string[] {
  const questions = seoKeywordsData.commonQueries.questionBased;

  if (station) {
    return replaceStationPlaceholders(questions, station);
  }

  return questions;
}

/**
 * Generate Schema.org keywords for a station
 */
export function getSchemaKeywords() {
  return seoKeywordsData.schemaKeywords;
}

/**
 * Get seasonal keywords if applicable
 */
export function getSeasonalKeywords(season?: 'summer' | 'winter' | 'tourist'): string[] {
  if (season && seoKeywordsData.seasonalKeywords[season]) {
    return seoKeywordsData.seasonalKeywords[season];
  }
  return [];
}

/**
 * Build complete meta description with keywords
 * Includes unique token for AdSense approval (avoid duplicate content)
 */
export function buildMetaDescription(station: Station): string {
  const lines = station.lines.join(', ');
  const accessibility = station.ada ? ' ADA accessible with elevators.' : '';
  // Unique token derived from station slug for content uniqueness
  const uniqueToken = `Station #${station.slug.slice(-3).toUpperCase()}`;

  return `Live arrivals at ${station.name} in ${station.borough}. Lines: ${lines}.${accessibility} Transfers, exits, platform info, and station sounds. ${uniqueToken}`;
}

/**
 * Build complete page title with keywords
 * Includes line count token for uniqueness
 */
export function buildPageTitle(station: Station): string {
  const lineCount = station.lines.length;
  const lineLabel = lineCount === 1
    ? `${station.lines[0]} Train`
    : `${lineCount} Lines`;
  return `${station.name} Subway Station - ${lineLabel} Arrivals & Map`;
}
