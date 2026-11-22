/**
 * Neighborhood Service
 * Service for neighborhood GEO hub pages with station data
 */

import fs from 'fs';
import path from 'path';
import { mtaDataService, Station } from './mta-data-service';

export interface Neighborhood {
  slug: string;
  name: string;
  borough: string;
  stationSlugs: string[];
  keyLines: string[];
  landmarks: string[];
  editorialIntro: string;
}

interface NeighborhoodsData {
  neighborhoods: Neighborhood[];
}

class NeighborhoodService {
  private static instance: NeighborhoodService;
  private neighborhoods: Neighborhood[] = [];
  private neighborhoodsBySlug: Map<string, Neighborhood> = new Map();

  private constructor() {
    this.loadNeighborhoodData();
  }

  public static getInstance(): NeighborhoodService {
    if (!NeighborhoodService.instance) {
      NeighborhoodService.instance = new NeighborhoodService();
    }
    return NeighborhoodService.instance;
  }

  private loadNeighborhoodData(): void {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const neighborhoodsPath = path.join(dataDir, 'neighborhoods.json');
      const data: NeighborhoodsData = JSON.parse(
        fs.readFileSync(neighborhoodsPath, 'utf8')
      );

      this.neighborhoods = data.neighborhoods;

      // Build lookup map
      this.neighborhoods.forEach((neighborhood) => {
        this.neighborhoodsBySlug.set(neighborhood.slug, neighborhood);
      });
    } catch (error) {
      console.error('Error loading neighborhood data:', error);
      this.neighborhoods = [];
    }
  }

  /**
   * Get all neighborhoods
   */
  public getAllNeighborhoods(): Neighborhood[] {
    return this.neighborhoods;
  }

  /**
   * Get neighborhood by slug
   */
  public getNeighborhood(slug: string): Neighborhood | undefined {
    return this.neighborhoodsBySlug.get(slug);
  }

  /**
   * Get stations in a neighborhood
   */
  public getStationsInNeighborhood(slug: string): Station[] {
    const neighborhood = this.getNeighborhood(slug);
    if (!neighborhood) return [];

    const stations: Station[] = [];

    for (const stationSlug of neighborhood.stationSlugs) {
      const station = mtaDataService.getStationBySlug(stationSlug);
      if (station) {
        stations.push(station);
      }
    }

    return stations;
  }

  /**
   * Get neighborhoods by borough
   */
  public getNeighborhoodsByBorough(borough: string): Neighborhood[] {
    return this.neighborhoods.filter(
      (n) => n.borough.toLowerCase() === borough.toLowerCase()
    );
  }

  /**
   * Get all unique lines serving a neighborhood
   */
  public getNeighborhoodLines(slug: string): string[] {
    const stations = this.getStationsInNeighborhood(slug);
    const linesSet = new Set<string>();

    stations.forEach((station) => {
      station.lines.forEach((line) => linesSet.add(line));
    });

    return Array.from(linesSet).sort();
  }
}

export const neighborhoodService = NeighborhoodService.getInstance();
export default NeighborhoodService;
