// Station Complex Mapping System
// This handles stations where multiple lines serve different physical platforms
// but are grouped under the same street name

export interface StationPlatform {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
  avenue?: string; // The avenue/street the platform is actually on
}

// Known NYC subway line groupings by infrastructure
const LINE_GROUPS = {
  IRT_LEXINGTON: ['4', '5', '6'],           // Lexington Ave Line
  IRT_BROADWAY: ['1', '2', '3'],            // Broadway-7th Ave Line  
  BMT_BROADWAY: ['N', 'Q', 'R', 'W'],       // Broadway Line (BMT)
  IND_8TH_AVE: ['A', 'B', 'C', 'D'],        // 8th Avenue Line
  IND_6TH_AVE: ['B', 'D', 'F', 'M'],        // 6th Avenue Line
  BMT_4TH_AVE: ['D', 'N', 'R'],             // 4th Avenue Line
  IRT_7: ['7'],                              // Flushing Line
  BMT_CANARSIE: ['L'],                       // Canarsie Line (L)
  BMT_NASSAU: ['J', 'Z'],                    // Nassau Street Line
  IND_CROSSTOWN: ['G'],                      // Crosstown Line
  IRT_JEROME: ['4'],                         // Jerome Ave Line
  IRT_WHITE_PLAINS: ['6'],                   // White Plains Road Line
};

// Street-based station complex definitions
export const STATION_COMPLEXES: Record<string, StationPlatform[]> = {
  "103rd St": [
    {
      id: "103rd-st-broadway",
      name: "103rd St - Broadway",
      lines: ["1"],
      coordinates: [-73.968379, 40.799446],
      avenue: "Broadway"
    },
    {
      id: "103rd-st-central-park-west", 
      name: "103rd St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.958150, 40.796060],
      avenue: "Central Park West"
    }
  ],

  "96th St": [
    {
      id: "96th-st-broadway",
      name: "96th St - Broadway", 
      lines: ["1", "2", "3"],
      coordinates: [-73.972323, 40.793919],
      avenue: "Broadway"
    },
    {
      id: "96th-st-central-park-west",
      name: "96th St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.969648, 40.791642],
      avenue: "Central Park West"  
    },
    {
      id: "96th-st-lexington-ave",
      name: "96th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.951822, 40.785672],
      avenue: "Lexington Ave"
    }
  ],

  "86th St": [
    {
      id: "86th-st-broadway",
      name: "86th St - Broadway",
      lines: ["1", "2"],
      coordinates: [-73.976041, 40.788644],
      avenue: "Broadway"
    },
    {
      id: "86th-st-central-park-west",
      name: "86th St - Central Park West", 
      lines: ["B", "C"],
      coordinates: [-73.976229, 40.785672],
      avenue: "Central Park West"
    },
    {
      id: "86th-st-lexington-ave",
      name: "86th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.955589, 40.779492],
      avenue: "Lexington Ave"
    }
  ],

  "72nd St": [
    {
      id: "72nd-st-broadway",
      name: "72nd St - Broadway",
      lines: ["1", "2", "3"],
      coordinates: [-73.981906, 40.778453],
      avenue: "Broadway"
    },
    {
      id: "72nd-st-central-park-west",
      name: "72nd St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.975939, 40.775594],
      avenue: "Central Park West"
    }
  ],

  "59th St": [
    {
      id: "59th-st-columbus-circle",
      name: "59th St - Columbus Circle",
      lines: ["1", "2", "A", "B", "C", "D"],
      coordinates: [-73.981929, 40.768247],
      avenue: "Broadway/8th Ave"
    },
    {
      id: "59th-st-lexington-ave", 
      name: "59th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.967967, 40.762526],
      avenue: "Lexington Ave"
    }
  ],

  "135th St": [
    {
      id: "135th-st-lenox-ave",
      name: "135th St - Lenox Ave", 
      lines: ["2", "3"],
      coordinates: [-73.940496, 40.814229],
      avenue: "Lenox Ave"
    },
    {
      id: "135th-st-st-nicholas-ave",
      name: "135th St - St Nicholas Ave",
      lines: ["B", "C"],
      coordinates: [-73.947649, 40.817894],
      avenue: "St Nicholas Ave"  
    }
  ],

  "145th St": [
    {
      id: "145th-st-broadway",
      name: "145th St - Broadway",
      lines: ["1"],
      coordinates: [-73.950354, 40.824783],
      avenue: "Broadway"
    },
    {
      id: "145th-st-st-nicholas-ave", 
      name: "145th St - St Nicholas Ave",
      lines: ["A", "B", "C", "D"],
      coordinates: [-73.944216, 40.820421],
      avenue: "St Nicholas Ave"
    }
  ]
};

/**
 * Automatically split a conflated station into separate platform entries
 */
export function splitStationComplex(stationName: string, lines: string[]): StationPlatform[] {
  // Check if we have a predefined complex mapping
  if (STATION_COMPLEXES[stationName]) {
    return STATION_COMPLEXES[stationName].filter(platform => 
      platform.lines.some(line => lines.includes(line))
    );
  }

  // Auto-detect based on line groupings
  const platforms: StationPlatform[] = [];
  const processedLines = new Set<string>();

  for (const line of lines) {
    if (processedLines.has(line)) continue;

    // Find which group this line belongs to
    const group = Object.entries(LINE_GROUPS).find(([_, groupLines]) => 
      groupLines.includes(line)
    );

    if (group) {
      const [groupName, groupLines] = group;
      const platformLines = groupLines.filter(l => lines.includes(l));
      
      if (platformLines.length > 0) {
        platforms.push({
          id: `${stationName.toLowerCase().replace(/\s+/g, '-')}-${groupName.toLowerCase()}`,
          name: `${stationName} - ${getAvenueForGroup(groupName)}`,
          lines: platformLines,
          coordinates: [0, 0], // Will need to be filled with actual coordinates
        });

        platformLines.forEach(l => processedLines.add(l));
      }
    }
  }

  return platforms;
}

/**
 * Map line groups to their typical avenue/street names
 */
function getAvenueForGroup(groupName: string): string {
  const avenueMap: Record<string, string> = {
    'IRT_LEXINGTON': 'Lexington Ave',
    'IRT_BROADWAY': 'Broadway', 
    'BMT_BROADWAY': 'Broadway',
    'IND_8TH_AVE': '8th Ave',
    'IND_6TH_AVE': '6th Ave',
    'BMT_4TH_AVE': '4th Ave',
    'IRT_7': 'Roosevelt Ave',
    'BMT_CANARSIE': '14th St',
    'BMT_NASSAU': 'Nassau St',
    'IND_CROSSTOWN': 'Crosstown',
  };
  return avenueMap[groupName] || 'Unknown Ave';
}

/**
 * Check if a station needs to be split based on incompatible line groupings
 */
export function shouldSplitStation(lines: string[]): boolean {
  const groups = new Set<string>();
  
  for (const line of lines) {
    for (const [groupName, groupLines] of Object.entries(LINE_GROUPS)) {
      if (groupLines.includes(line)) {
        groups.add(groupName);
        break;
      }
    }
  }
  
  // If lines belong to more than one group, station should be split
  return groups.size > 1;
}