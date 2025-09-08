import { NextResponse } from 'next/server';
import stationsData from '@/data/nyc-subway-stations-official.json';

export const dynamic = 'force-dynamic';

export interface SubwayStation {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number]; // [longitude, latitude]
  borough: string;
  complex?: boolean;
}

// Load all NYC Subway Stations from official MTA coordinates (360+ stations)
const SUBWAY_STATIONS: SubwayStation[] = stationsData.stations.map(station => ({
  ...station,
  coordinates: station.coordinates as [number, number]
}));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lines = searchParams.get('lines')?.split(',') || [];
  const borough = searchParams.get('borough');

  let filteredStations = SUBWAY_STATIONS;

  // Filter by subway lines
  if (lines.length > 0 && !lines.includes('all')) {
    filteredStations = filteredStations.filter(station =>
      station.lines.some(line => lines.includes(line))
    );
  }

  // Filter by borough
  if (borough) {
    filteredStations = filteredStations.filter(station =>
      station.borough.toLowerCase() === borough.toLowerCase()
    );
  }

  // Add caching headers
  const response = NextResponse.json({
    stations: filteredStations,
    total: filteredStations.length,
    timestamp: new Date().toISOString(),
  });

  response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  
  return response;
}