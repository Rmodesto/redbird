/**
 * MTA Data Service
 * Centralized service for fetching MTA train data, schedules, and real-time information
 */

import fs from 'fs';
import path from 'path';

// Types
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
  amenities?: string[];
}

export interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

export interface LineInfo {
  line: string;
  color: string;
  textColor: string;
  division: 'IRT' | 'BMT' | 'IND' | 'SIR';
  routes?: string[];
  terminals?: {
    north: string;
    south: string;
  };
}

export interface TrainArrival {
  line: string;
  direction: 'N' | 'S';
  destinationStation: string;
  arrivalTime: Date;
  minutesAway: number;
  isDelayed: boolean;
  isRerouted: boolean;
}

export interface ServiceAlert {
  id: string;
  lines: string[];
  type: 'DELAYS' | 'SERVICE_CHANGE' | 'PLANNED_WORK';
  header: string;
  description: string;
  startTime?: Date;
  endTime?: Date;
}

// Singleton class for MTA data operations
class MTADataService {
  private static instance: MTADataService;
  private stationsData: Station[] | null = null;
  private stationsByGtfsId: Map<string, Station> = new Map();
  private stationsBySlug: Map<string, Station> = new Map();
  private lineInfo: Map<string, LineInfo> = new Map();

  private constructor() {
    this.initializeLineInfo();
    this.loadStationData();
  }

  public static getInstance(): MTADataService {
    if (!MTADataService.instance) {
      MTADataService.instance = new MTADataService();
    }
    return MTADataService.instance;
  }

  /**
   * Initialize subway line information
   */
  private initializeLineInfo() {
    const lines: LineInfo[] = [
      // IRT Lines
      { line: '1', color: '#EE352E', textColor: '#FFFFFF', division: 'IRT', terminals: { north: '242 St-Van Cortlandt Park', south: 'South Ferry' } },
      { line: '2', color: '#EE352E', textColor: '#FFFFFF', division: 'IRT', terminals: { north: '241 St', south: 'Flatbush Av-Brooklyn College' } },
      { line: '3', color: '#EE352E', textColor: '#FFFFFF', division: 'IRT', terminals: { north: '148 St-Lenox Terminal', south: 'New Lots Av' } },
      { line: '4', color: '#00933C', textColor: '#FFFFFF', division: 'IRT', terminals: { north: 'Woodlawn', south: 'Crown Hts-Utica Av' } },
      { line: '5', color: '#00933C', textColor: '#FFFFFF', division: 'IRT', terminals: { north: 'Eastchester-Dyre Av', south: 'Flatbush Av-Brooklyn College' } },
      { line: '6', color: '#00933C', textColor: '#FFFFFF', division: 'IRT', terminals: { north: 'Pelham Bay Park', south: 'Brooklyn Bridge-City Hall' } },
      { line: '7', color: '#B933AD', textColor: '#FFFFFF', division: 'IRT', terminals: { north: 'Flushing-Main St', south: '34 St-Hudson Yards' } },
      
      // BMT Lines
      { line: 'J', color: '#996633', textColor: '#FFFFFF', division: 'BMT', terminals: { north: 'Jamaica Center', south: 'Broad St' } },
      { line: 'L', color: '#A7A9AC', textColor: '#FFFFFF', division: 'BMT', terminals: { north: '8 Av', south: 'Canarsie-Rockaway Pkwy' } },
      { line: 'M', color: '#FF6319', textColor: '#FFFFFF', division: 'BMT', terminals: { north: 'Forest Hills-71 Av', south: 'Middle Village-Metropolitan Av' } },
      { line: 'N', color: '#FCCC0A', textColor: '#000000', division: 'BMT', terminals: { north: 'Astoria-Ditmars Blvd', south: 'Coney Island-Stillwell Av' } },
      { line: 'Q', color: '#FCCC0A', textColor: '#000000', division: 'BMT', terminals: { north: '96 St', south: 'Coney Island-Stillwell Av' } },
      { line: 'R', color: '#FCCC0A', textColor: '#000000', division: 'BMT', terminals: { north: 'Forest Hills-71 Av', south: 'Bay Ridge-95 St' } },
      { line: 'W', color: '#FCCC0A', textColor: '#000000', division: 'BMT', terminals: { north: 'Astoria-Ditmars Blvd', south: 'Whitehall St-South Ferry' } },
      { line: 'Z', color: '#996633', textColor: '#FFFFFF', division: 'BMT', terminals: { north: 'Jamaica Center', south: 'Broad St' } },
      
      // IND Lines
      { line: 'A', color: '#0039A6', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Inwood-207 St', south: 'Far Rockaway/Lefferts Blvd' } },
      { line: 'B', color: '#FF6319', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Bedford Park Blvd', south: 'Brighton Beach' } },
      { line: 'C', color: '#0039A6', textColor: '#FFFFFF', division: 'IND', terminals: { north: '168 St', south: 'Euclid Av' } },
      { line: 'D', color: '#FF6319', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Norwood-205 St', south: 'Coney Island-Stillwell Av' } },
      { line: 'E', color: '#0039A6', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Jamaica Center', south: 'World Trade Center' } },
      { line: 'F', color: '#FF6319', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Jamaica-179 St', south: 'Coney Island-Stillwell Av' } },
      { line: 'G', color: '#6CBE45', textColor: '#FFFFFF', division: 'IND', terminals: { north: 'Court Sq', south: 'Church Av' } },
      
      // Shuttles
      { line: 'S', color: '#808183', textColor: '#FFFFFF', division: 'BMT', routes: ['42nd St', 'Franklin Av', 'Rockaway Park'] },
      
      // Staten Island Railway
      { line: 'SIR', color: '#0039A6', textColor: '#FFFFFF', division: 'SIR', terminals: { north: 'St George', south: 'Tottenville' } },
    ];

    lines.forEach(line => {
      this.lineInfo.set(line.line, line);
    });
  }

  /**
   * Load station data from JSON files
   */
  private loadStationData() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const stationsPath = path.join(dataDir, 'stations.json');
      
      // Read fresh data from filesystem
      this.stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      
      // Clear existing maps
      this.stationsByGtfsId.clear();
      this.stationsBySlug.clear();
      
      // Build lookup maps for efficient access
      this.stationsData?.forEach(station => {
        // Map by ID (now using complex_id)
        if (station.id) {
          this.stationsByGtfsId.set(station.id, station);
        }
        
        // Map by slug
        if (station.slug) {
          this.stationsBySlug.set(station.slug, station);
        }
      });
      
      console.log(`[MTA Service] Loaded ${this.stationsData?.length} stations (normalized complexes)`);
    } catch (error) {
      console.error('[MTA Service] Error loading station data:', error);
      console.error('[MTA Service] Process cwd:', process.cwd());
      console.error('[MTA Service] Looking for:', path.join(process.cwd(), 'data', 'stations.json'));
    }
  }

  /**
   * Get station by GTFS ID
   */
  public getStationById(gtfsId: string): Station | null {
    return this.stationsByGtfsId.get(gtfsId) || null;
  }

  /**
   * Get station by slug
   */
  public getStationBySlug(slug: string): Station | null {
    return this.stationsBySlug.get(slug) || null;
  }

  /**
   * Get all stations
   */
  public getAllStations(): Station[] {
    return this.stationsData || [];
  }

  /**
   * Get stations by line
   */
  public getStationsByLine(line: string): Station[] {
    return this.stationsData?.filter(station => 
      station.lines.includes(line.toUpperCase())
    ) || [];
  }

  /**
   * Get stations by borough
   */
  public getStationsByBorough(borough: string): Station[] {
    return this.stationsData?.filter(station => 
      station.borough.toLowerCase() === borough.toLowerCase()
    ) || [];
  }

  /**
   * Get line information
   */
  public getLineInfo(line: string): LineInfo | null {
    return this.lineInfo.get(line.toUpperCase()) || null;
  }

  /**
   * Get all line information
   */
  public getAllLineInfo(): LineInfo[] {
    return Array.from(this.lineInfo.values());
  }

  /**
   * Search stations by name
   */
  public searchStations(query: string, limit = 10): Station[] {
    const searchTerm = query.toLowerCase();
    const results = this.stationsData?.filter(station => 
      station.name.toLowerCase().includes(searchTerm) ||
      station.slug.includes(searchTerm) ||
      station.borough.toLowerCase().includes(searchTerm)
    ) || [];
    
    return results.slice(0, limit);
  }

  /**
   * Get nearby stations
   */
  public getNearbyStations(lat: number, lng: number, radiusKm = 1): Station[] {
    const results: Array<{ station: Station; distance: number }> = [];
    
    this.stationsData?.forEach(station => {
      const distance = this.calculateDistance(lat, lng, station.latitude, station.longitude);
      if (distance <= radiusKm) {
        results.push({ station, distance });
      }
    });
    
    // Sort by distance and return stations
    return results
      .sort((a, b) => a.distance - b.distance)
      .map(r => r.station);
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  /**
   * Get train arrivals for a station (placeholder for real-time data)
   * In production, this would connect to MTA's GTFS-RT feed
   */
  public async getTrainArrivals(stationId: string): Promise<TrainArrival[]> {
    // TODO: Implement real-time GTFS feed integration
    // For now, return mock data
    const station = this.getStationById(stationId);
    if (!station) return [];

    const mockArrivals: TrainArrival[] = [];
    const now = new Date();

    // Generate mock arrivals for each line at the station
    station.lines.forEach(line => {
      // Northbound
      mockArrivals.push({
        line,
        direction: 'N',
        destinationStation: this.lineInfo.get(line)?.terminals?.north || 'Uptown',
        arrivalTime: new Date(now.getTime() + Math.random() * 15 * 60000), // Random 0-15 minutes
        minutesAway: Math.floor(Math.random() * 15),
        isDelayed: Math.random() > 0.8,
        isRerouted: false
      });

      // Southbound
      mockArrivals.push({
        line,
        direction: 'S',
        destinationStation: this.lineInfo.get(line)?.terminals?.south || 'Downtown',
        arrivalTime: new Date(now.getTime() + Math.random() * 15 * 60000),
        minutesAway: Math.floor(Math.random() * 15),
        isDelayed: Math.random() > 0.9,
        isRerouted: false
      });
    });

    return mockArrivals.sort((a, b) => a.minutesAway - b.minutesAway);
  }

  /**
   * Get service alerts for specific lines
   */
  public async getServiceAlerts(lines?: string[]): Promise<ServiceAlert[]> {
    // TODO: Implement MTA service alerts API integration
    // For now, return mock data
    const mockAlerts: ServiceAlert[] = [
      {
        id: 'alert-1',
        lines: ['4', '5', '6'],
        type: 'DELAYS',
        header: 'Delays on 4/5/6 lines',
        description: 'Due to signal problems at 14 St-Union Sq, expect delays in both directions.',
        startTime: new Date()
      },
      {
        id: 'alert-2',
        lines: ['L'],
        type: 'PLANNED_WORK',
        header: 'Weekend L train service change',
        description: 'L trains run in two sections this weekend. Transfer at Lorimer St.',
        startTime: new Date(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    ];

    if (lines && lines.length > 0) {
      return mockAlerts.filter(alert => 
        alert.lines.some(line => lines.includes(line))
      );
    }

    return mockAlerts;
  }

  /**
   * Refresh station data (for use with hot reload or periodic updates)
   */
  public refreshData(): void {
    this.stationsData = null;
    this.stationsByGtfsId.clear();
    this.stationsBySlug.clear();
    this.loadStationData();
  }
}

// Export singleton instance
export const mtaDataService = MTADataService.getInstance();