// NYC Subway line groupings and utilities for accurate line identification

export interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

export interface Station {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  borough: string;
  platforms: Platform[];
  lines: string[];
  amenities: string[];
}

// MTA Feed mapping for real-time data validation
export const MTA_FEEDS = {
  'ACE': ['A', 'C', 'E'],
  'BDFM': ['B', 'D', 'F', 'M'],
  'G': ['G'],
  'JZ': ['J', 'Z'],
  'NQRW': ['N', 'Q', 'R', 'W'],
  'L': ['L'],
  '123456': ['1', '2', '3', '4', '5', '6'],
  '7': ['7']
} as const;

// NYC Subway line groupings by actual subway lines
export const SUBWAY_LINES = {
  // IRT Lines (numbered trains)
  'broadway-7th-ave': {
    trains: ['1', '2', '3'],
    name: 'Broadway-7th Ave Line',
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn']
  },
  'lexington-ave': {
    trains: ['4', '5', '6'],
    name: 'Lexington Ave Line', 
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn']
  },
  'flushing': {
    trains: ['7'],
    name: 'Flushing Line',
    boroughs: ['Manhattan', 'Queens']
  },
  
  // BMT/IND Lines (lettered trains)
  '8th-ave': {
    trains: ['A', 'C', 'E'],
    name: '8th Ave Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  '6th-ave-broadway': {
    trains: ['B', 'D', 'F', 'M'],
    name: '6th Ave Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'broadway-bmt': {
    trains: ['N', 'Q', 'R', 'W'],
    name: 'Broadway Line (BMT)',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'jamaica': {
    trains: ['J', 'Z'],
    name: 'Jamaica Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'canarsie': {
    trains: ['L'],
    name: '14th St-Canarsie Line',
    boroughs: ['Manhattan', 'Brooklyn']
  },
  'crosstown': {
    trains: ['G'],
    name: 'Brooklyn-Queens Crosstown',
    boroughs: ['Brooklyn', 'Queens']
  }
} as const;

/**
 * Consolidates platform line data into station-level lines
 */
export function consolidateStationLines(station: Station): string[] {
  // If station already has lines, use them (but validate if needed)
  if (station.lines && station.lines.length > 0) {
    return Array.from(new Set(station.lines)).sort();
  }

  // Extract lines from platforms
  const platformLines = station.platforms
    .flatMap(platform => platform.lines)
    .filter(line => line && line.trim() !== '');

  if (platformLines.length > 0) {
    // Remove duplicates and sort
    return Array.from(new Set(platformLines)).sort((a, b) => {
      // Sort numbered lines first, then lettered lines
      const aNum = /^\d+$/.test(a);
      const bNum = /^\d+$/.test(b);
      
      if (aNum && !bNum) return -1;
      if (!aNum && bNum) return 1;
      
      return a.localeCompare(b);
    });
  }

  // If no platform data available, try to infer from station/stop IDs
  const inferredLines = inferLinesFromStationId(station);
  if (inferredLines.length > 0) {
    return inferredLines;
  }

  return [];
}

/**
 * Infers subway lines from station ID and stop ID patterns
 */
function inferLinesFromStationId(station: Station): string[] {
  const stationId = station.id;
  const stopIds = station.platforms.map(p => p.stopId);
  
  // Pattern matching for different line types
  if (/^L\d+/.test(stationId) || stopIds.some(id => /^L\d+[NS]/.test(id))) {
    return ['L'];
  }
  
  if (/^[1-3]\d+/.test(stationId) || stopIds.some(id => /^[1-3]\d+[NS]/.test(id))) {
    // Could be 1, 2, or 3 train - need more sophisticated logic
    // For now, check the most common patterns
    if (stationId.startsWith('1') || stopIds.some(id => id.startsWith('1'))) {
      return ['1'];
    }
  }
  
  if (/^[4-6]\d+/.test(stationId) || stopIds.some(id => /^[4-6]\d+[NS]/.test(id))) {
    // 4, 5, 6 trains
    if (stationId.startsWith('4') || stopIds.some(id => id.startsWith('4'))) {
      return ['4'];
    }
    if (stationId.startsWith('5') || stopIds.some(id => id.startsWith('5'))) {
      return ['5'];
    }
    if (stationId.startsWith('6') || stopIds.some(id => id.startsWith('6'))) {
      return ['6'];
    }
  }
  
  if (/^7\d+/.test(stationId) || stopIds.some(id => /^7\d+[NS]/.test(id))) {
    return ['7'];
  }
  
  // Letter-based patterns
  if (/^A\d+/.test(stationId) || stopIds.some(id => /^A\d+[NS]/.test(id))) {
    return ['A'];
  }
  
  if (/^[BDFM]\d+/.test(stationId) || stopIds.some(id => /^[BDFM]\d+[NS]/.test(id))) {
    // Could be B, D, F, or M
    const firstChar = stationId.charAt(0);
    if (['B', 'D', 'F', 'M'].includes(firstChar)) {
      return [firstChar];
    }
  }
  
  if (/^G\d+/.test(stationId) || stopIds.some(id => /^G\d+[NS]/.test(id))) {
    return ['G'];
  }
  
  if (/^[JZ]\d+/.test(stationId) || stopIds.some(id => /^[JZ]\d+[NS]/.test(id))) {
    const firstChar = stationId.charAt(0);
    if (['J', 'Z'].includes(firstChar)) {
      return [firstChar];
    }
  }
  
  if (/^[NQRW]\d+/.test(stationId) || stopIds.some(id => /^[NQRW]\d+[NS]/.test(id))) {
    const firstChar = stationId.charAt(0);
    if (['N', 'Q', 'R', 'W'].includes(firstChar)) {
      return [firstChar];
    }
  }
  
  return [];
}

/**
 * Validates if station lines are accurate based on borough and known line routes
 */
export function validateStationLines(station: Station, lines: string[]): {
  isValid: boolean;
  suggestedLines?: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  
  if (lines.length === 0) {
    warnings.push('No lines found for station');
    return { isValid: false, warnings };
  }

  // Check if lines make sense for the borough
  const boroughValidation = validateLinesByBorough(station.borough, lines);
  if (!boroughValidation.isValid) {
    warnings.push(...boroughValidation.warnings);
  }

  // Check if line combination makes sense (trains that typically run together)
  const combinationValidation = validateLineCombination(lines);
  if (!combinationValidation.isValid) {
    warnings.push(...combinationValidation.warnings);
  }

  return {
    isValid: warnings.length === 0,
    suggestedLines: boroughValidation.suggestedLines || combinationValidation.suggestedLines,
    warnings
  };
}

/**
 * Validates lines based on borough - some lines don't serve certain boroughs
 */
function validateLinesByBorough(borough: string, lines: string[]): {
  isValid: boolean;
  suggestedLines?: string[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const validLines: string[] = [];

  for (const line of lines) {
    const lineGroup = findLineGroup(line);
    if (lineGroup && !Array.from(lineGroup.boroughs).includes(borough as any)) {
      warnings.push(`${line} line typically doesn't serve ${borough}`);
    } else {
      validLines.push(line);
    }
  }

  return {
    isValid: warnings.length === 0,
    suggestedLines: validLines.length > 0 ? validLines : undefined,
    warnings
  };
}

/**
 * Validates if line combinations make sense (e.g., 1,2,3 often run together)
 */
function validateLineCombination(lines: string[]): {
  isValid: boolean;
  suggestedLines?: string[];
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for unlikely combinations
  const numberedLines = lines.filter(line => /^\d+$/.test(line));
  const letteredLines = lines.filter(line => /^[A-Z]$/.test(line));

  // If we have both numbered and lettered lines, that's often unusual for smaller stations
  if (numberedLines.length > 0 && letteredLines.length > 0 && lines.length > 4) {
    warnings.push('Station serves many different line types - this is unusual except for major transfer hubs');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Finds which line group a train belongs to
 */
function findLineGroup(train: string) {
  for (const [key, lineInfo] of Object.entries(SUBWAY_LINES)) {
    if ((lineInfo.trains as readonly string[]).includes(train)) {
      return lineInfo;
    }
  }
  return null;
}

/**
 * Gets MTA feed URLs that should contain data for the given lines
 */
export function getRelevantMTAFeeds(lines: string[]): string[] {
  const feeds: string[] = [];
  
  for (const line of lines) {
    for (const [feedName, feedLines] of Object.entries(MTA_FEEDS)) {
      if ((feedLines as readonly string[]).includes(line)) {
        feeds.push(feedName);
        break;
      }
    }
  }
  
  return Array.from(new Set(feeds)); // Remove duplicates
}

/**
 * Enriches station data with accurate line information
 */
export async function enrichStationWithLines(station: Station): Promise<{
  station: Station;
  lines: string[];
  validation: ReturnType<typeof validateStationLines>;
}> {
  // First, consolidate lines from platforms if station lines are empty
  const consolidatedLines = consolidateStationLines(station);
  
  // Validate the lines
  const validation = validateStationLines(station, consolidatedLines);
  
  // Use suggested lines if validation failed and suggestions exist
  const finalLines = validation.suggestedLines || consolidatedLines;
  
  // Update station object
  const enrichedStation: Station = {
    ...station,
    lines: finalLines
  };

  return {
    station: enrichedStation,
    lines: finalLines,
    validation
  };
}