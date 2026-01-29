/**
 * Subway Line Colors Utility
 *
 * Re-exports from centralized constants for backwards compatibility.
 * New code should import directly from '@/lib/constants'.
 */

import {
  MTA_TAILWIND_COLORS,
  type TailwindLineColor,
  getLineTailwindColor,
} from '@/lib/constants';

// Re-export types for backwards compatibility
export type SubwayLineColors = TailwindLineColor;

// Re-export the color map
export const SUBWAY_LINE_COLORS = MTA_TAILWIND_COLORS;

/**
 * Get color configuration for a subway line
 * @deprecated Use getLineTailwindColor from '@/lib/constants' instead
 */
export function getSubwayLineColor(line: string): SubwayLineColors {
  return getLineTailwindColor(line);
}

/**
 * Get combined Tailwind classes for a subway line badge
 * @deprecated Use getLineBgClass and getLineTextClass from '@/lib/constants' instead
 */
export function getSubwayLineColorClasses(line: string): string {
  const colors = getLineTailwindColor(line);
  return `${colors.bg} ${colors.text}`;
}
