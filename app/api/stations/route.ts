import fs from 'fs';
import path from 'path';
import type { Station, Platform } from '@/lib/types';
import { apiSuccess, serverError, CACHE_HEADERS } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

// Extended Station type for this route (includes amenities as string array from JSON)
interface StationData extends Omit<Station, 'amenities'> {
  amenities: string[];
}

let stationsData: StationData[] | null = null;
let slugLookup: Record<string, string> | null = null;
let stopIdLookup: Record<string, { stationId: string; direction: string }> | null = null;

function loadStationData() {
  if (!stationsData) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const stationsPath = path.join(dataDir, 'stations-normalized.json');
      
      stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      
      console.log(`Loaded ${stationsData?.length || 0} stations from normalized complexes (445 total)`);
    } catch (error) {
      console.error('Error loading station data:', error);
      throw error;
    }
  }
}

export async function GET(request: Request) {
  try {
    loadStationData();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const borough = searchParams.get('borough');
    const line = searchParams.get('line');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredStations = [...(stationsData || [])];
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStations = filteredStations.filter(station => 
        station.name.toLowerCase().includes(searchLower) ||
        station.slug.includes(searchLower) ||
        station.borough.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by borough
    if (borough) {
      filteredStations = filteredStations.filter(station =>
        station.borough.toLowerCase() === borough.toLowerCase()
      );
    }
    
    // Filter by line
    if (line) {
      filteredStations = filteredStations.filter(station =>
        station.lines.includes(line.toUpperCase())
      );
    }
    
    // Limit results (cap at 100 to prevent abuse)
    const safeLimit = Math.min(Math.max(1, limit), 100);
    filteredStations = filteredStations.slice(0, safeLimit);

    return apiSuccess(
      {
        stations: filteredStations,
        total: filteredStations.length,
        filters: { search, borough, line, limit: safeLimit }
      },
      CACHE_HEADERS.MEDIUM
    );

  } catch (error) {
    console.error('[API /stations] Error:', error);
    return serverError('Failed to fetch station data');
  }
}