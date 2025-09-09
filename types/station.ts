// Core station data structure
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

export interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

// Station score and rating system
export interface StationScore {
  score: number;
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

// Crime statistics
export interface CrimeStats {
  felonies: number;
  misdemeanors: number;
  violations: number;
  year: number;
  radius: number; // in miles
  lastUpdated: Date;
}

// Rodent reports from 311 data
export interface RodentReports {
  count: number;
  year: number;
  radius: number; // in miles
  lastUpdated: Date;
  trend?: 'up' | 'down' | 'neutral';
  monthlyData?: MonthlyRodentData[];
}

export interface MonthlyRodentData {
  month: string;
  count: number;
}

// Real-time arrival data
export interface TrainArrival {
  line: string;
  direction: 'uptown' | 'downtown' | 'north' | 'south' | 'east' | 'west';
  destination: string;
  minutesAway: number;
  timestamp: Date;
  platform?: string;
}

export interface LiveArrivals {
  stationId: string;
  stationName: string;
  arrivals: TrainArrival[];
  lastUpdated: Date;
  dataSource: string;
}

// Station amenities and accessibility
export interface StationAmenities {
  ada: boolean;
  elevators: boolean;
  restrooms: boolean;
  policePresence: boolean;
  wifi: boolean;
  yearBuilt: number;
  stationType: 'underground' | 'elevated' | 'at-grade';
}

// Station metadata for pages
export interface StationPageData {
  station: Station;
  score: StationScore;
  crimeStats: CrimeStats;
  rodentReports: RodentReports;
  liveArrivals: LiveArrivals;
  amenities: StationAmenities;
  nearbyStations: Station[];
}