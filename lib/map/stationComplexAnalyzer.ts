import { shouldSplitStation, splitStationComplex } from './stationComplexMapping';

interface Station {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
  borough?: string;
  [key: string]: any;
}

/**
 * Analyze the dataset to find all stations that need to be split
 */
export function analyzeConflatedStations(stations: Station[]): {
  conflatedStations: Station[];
  splitStations: any[];
  totalFixed: number;
} {
  const conflatedStations: Station[] = [];
  const splitStations: any[] = [];

  for (const station of stations) {
    if (shouldSplitStation(station.lines)) {
      conflatedStations.push(station);
      
      // Get the split platforms for this station
      const platforms = splitStationComplex(station.name, station.lines);
      splitStations.push(...platforms.map(platform => ({
        ...station,
        ...platform,
        originalId: station.id,
        originalName: station.name,
      })));
    }
  }

  return {
    conflatedStations,
    splitStations,
    totalFixed: conflatedStations.length
  };
}

/**
 * Generate the corrected dataset with split station complexes
 */
export function fixStationDataset(stations: Station[]): Station[] {
  const fixedStations: Station[] = [];
  
  for (const station of stations) {
    if (shouldSplitStation(station.lines)) {
      // Split this station into multiple platforms
      const platforms = splitStationComplex(station.name, station.lines);
      
      if (platforms.length > 0) {
        // Add split platforms with original station data preserved
        platforms.forEach(platform => {
          fixedStations.push({
            ...station,
            id: platform.id,
            name: platform.name,
            lines: platform.lines,
            coordinates: platform.coordinates,
            avenue: platform.avenue,
            originalId: station.id,
          });
        });
      } else {
        // Keep original if no split mapping available
        fixedStations.push(station);
      }
    } else {
      // Keep non-conflated stations as-is
      fixedStations.push(station);
    }
  }

  return fixedStations;
}