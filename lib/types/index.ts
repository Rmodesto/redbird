/**
 * Centralized Type Definitions
 *
 * This file is the single source of truth for all shared TypeScript interfaces.
 * Import types from here instead of defining them inline in components or API routes.
 */

// =============================================================================
// Station Types
// =============================================================================

export interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

export interface StationAmenities {
  wifi: boolean;
  restrooms: boolean;
  elevators: boolean;
  yearBuilt: number | null;
}

export interface Station {
  id: string;
  gtfsId?: string;
  complexId?: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  borough: string;
  lines: string[];
  platforms: Platform[];
  ada: boolean;
  amenities?: StationAmenities;
}

// =============================================================================
// Line Types
// =============================================================================

export type Division = 'IRT' | 'BMT' | 'IND' | 'SIR';

export interface LineInfo {
  line: string;
  color: string;
  textColor: string;
  division: Division;
  routes?: string[];
  terminals?: {
    north: string;
    south: string;
  };
}

// =============================================================================
// Real-time Data Types
// =============================================================================

export type Direction = 'N' | 'S';
export type DirectionLabel = 'uptown' | 'downtown' | 'north' | 'south' | 'east' | 'west';

export interface TrainArrival {
  line: string;
  direction: Direction;
  destinationStation: string;
  arrivalTime: Date;
  minutesAway: number;
  isDelayed: boolean;
  isRerouted: boolean;
}

export type ServiceAlertType = 'DELAYS' | 'SERVICE_CHANGE' | 'PLANNED_WORK';

export interface ServiceAlert {
  id: string;
  lines: string[];
  type: ServiceAlertType;
  header: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface StationsApiResponse {
  stations: Station[];
  total: number;
  filters: {
    search: string | null;
    borough: string | null;
    line: string | null;
    limit: number;
  };
}

export interface StationDetailResponse {
  station: Station;
  lineInfo: LineInfo[];
  nearbyStations: Station[];
  metadata: {
    lastUpdated: string;
  };
}

export interface ArrivalsApiResponse {
  station: Station;
  arrivals: ArrivalInfo[];
  lastUpdated: string;
  debug?: {
    feedsQueried: string[];
    rawArrivalCount: number;
  };
}

export interface ArrivalInfo {
  line: string;
  direction: string;
  destination: string;
  arrivalTime: number;
  minutesUntil: number;
  stopId: string;
  tripId: string;
}

// =============================================================================
// Station Stats Types
// =============================================================================

export interface CrimeStats {
  felonies: number;
  misdemeanors: number;
  violations: number;
  year: number;
  radius: number;
  lastUpdated: Date;
}

export interface RodentReports {
  count: number;
  year: number;
  radius: number;
  lastUpdated: Date;
  trend?: 'up' | 'down' | 'neutral';
  monthlyData?: MonthlyRodentData[];
}

export interface MonthlyRodentData {
  month: string;
  count: number;
}

// =============================================================================
// Station Score Types
// =============================================================================

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export type StationRating = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface StationScore {
  score: number;
  rating: StationRating;
  factors: ScoreFactor[];
}

// =============================================================================
// Extended Amenities (for detailed views)
// =============================================================================

export interface DetailedAmenities {
  ada: boolean;
  elevators: boolean;
  restrooms: boolean;
  policePresence: boolean;
  wifi: boolean;
  yearBuilt: number;
  stationType: 'underground' | 'elevated' | 'at-grade';
}

// =============================================================================
// Page Data Types (for SSR)
// =============================================================================

export interface StationPageData {
  station: Station;
  score: StationScore;
  crimeStats: CrimeStats;
  rodentReports: RodentReports;
  liveArrivals: {
    stationId: string;
    stationName: string;
    arrivals: TrainArrival[];
    lastUpdated: Date;
    dataSource: string;
  };
  amenities: DetailedAmenities;
  nearbyStations: Station[];
}
