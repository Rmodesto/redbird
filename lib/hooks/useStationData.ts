import { useState, useEffect } from 'react';
import { 
  Station, 
  StationScore, 
  CrimeStats, 
  RodentReports, 
  StationAmenities, 
  LiveArrivals 
} from '@/types/station';
import { DataState } from '@/types/common';

export function useStationData(stationId: string) {
  const [stationData, setStationData] = useState<DataState<Station>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // This would fetch from your API
    // For now, we'll simulate the data transformation
    const fetchStationData = async () => {
      try {
        setStationData(prev => ({ ...prev, loading: true }));
        
        // This is where you'd fetch from your actual APIs
        // const response = await fetch(`/api/stations/${stationId}`);
        // const station = await response.json();
        
        // For now, return null to maintain the existing behavior
        setStationData({
          data: null,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } catch (error) {
        setStationData({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch station data',
        });
      }
    };

    if (stationId) {
      fetchStationData();
    }
  }, [stationId]);

  return stationData;
}

// Hook for calculating station score
export function useStationScore(station: Station | null): StationScore | null {
  if (!station) return null;

  // Mock scoring logic (can be enhanced with real data)
  let score = 100;

  // Deduct points based on various factors
  if (!station.amenities?.elevators) score -= 10;
  if (!station.amenities?.wifi) score -= 5;
  if (!station.amenities?.restrooms) score -= 5;

  const rating = score >= 90 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR';

  // Count available amenities
  const amenityCount = station.amenities
    ? (station.amenities.wifi ? 1 : 0) + (station.amenities.restrooms ? 1 : 0) + (station.amenities.elevators ? 1 : 0)
    : 0;

  return {
    score,
    rating,
    factors: [
      { name: 'Accessibility', value: station.amenities?.elevators ? 10 : 0, weight: 0.3, description: 'ADA compliance' },
      { name: 'Amenities', value: amenityCount, weight: 0.2, description: 'Available amenities' },
      { name: 'Connectivity', value: station.lines.length * 2, weight: 0.5, description: 'Number of lines served' },
    ]
  };
}

// Mock data generators for demonstration
export function generateMockCrimeStats(): CrimeStats {
  return {
    felonies: 0,
    misdemeanors: 0,
    violations: 0,
    year: 2024,
    radius: 0.25,
    lastUpdated: new Date(),
  };
}

export function generateMockRodentReports(): RodentReports {
  return {
    count: 0,
    year: 2024,
    radius: 0.25,
    lastUpdated: new Date(),
    trend: 'neutral',
  };
}

export function generateMockAmenities(station: Station): StationAmenities {
  return {
    ada: station.amenities?.elevators || false,
    elevators: station.amenities?.elevators || false,
    restrooms: station.amenities?.restrooms || false,
    policePresence: false, // Not available in data
    wifi: station.amenities?.wifi || false,
    yearBuilt: station.amenities?.yearBuilt || getStationYearBuilt(station.name),
    stationType: 'underground',
  };
}

function getStationYearBuilt(stationName: string): number {
  // Some actual NYC subway station opening years
  const stationYears: Record<string, number> = {
    'Grand Central-42 St': 1929,
    'Times Sq-42 St': 1904,
    'Union Sq-14 St': 1904,
    'Penn Station': 1910,
    'Atlantic Av-Barclays Ctr': 1908,
    'Jackson Heights-Roosevelt Ave': 1917,
  };
  
  return stationYears[stationName] || 1904 + Math.floor(Math.random() * 36);
}

export function generateMockLiveArrivals(station: Station): LiveArrivals {
  const arrivals = station.lines.slice(0, 5).map((line, index) => ({
    line,
    direction: 'downtown' as const,
    destination: `${station.borough} Terminal`,
    minutesAway: 5 + index * 2,
    timestamp: new Date(),
    platform: `${index + 1}`,
  }));

  return {
    stationId: station.id,
    stationName: station.name,
    arrivals,
    lastUpdated: new Date(),
    dataSource: 'MTA GTFS Real-time',
  };
}