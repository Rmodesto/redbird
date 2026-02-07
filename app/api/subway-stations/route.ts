import { NextResponse } from 'next/server';
import stationsData from '@/data/stations.json';
import { subwayStationsQuery } from '@/lib/api/schemas';
import { validationError } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export interface SubwayStation {
  id: string;
  name: string;
  slug?: string;
  lines: string[];
  coordinates: [number, number]; // [longitude, latitude]
  borough: string;
  complex?: boolean;
}

// Load all NYC Subway Stations from official MTA coordinates (360+ stations)
const SUBWAY_STATIONS: SubwayStation[] = stationsData.map((station: any) => ({
  id: station.id,
  name: station.name,
  slug: station.slug,
  lines: station.lines,
  coordinates: [station.longitude, station.latitude] as [number, number],
  borough: station.borough,
  complex: station.complex || false
}));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = subwayStationsQuery.safeParse({
    lines: searchParams.get('lines') ?? undefined,
    borough: searchParams.get('borough') ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const lines = parsed.data.lines?.split(',') || [];
  const borough = parsed.data.borough;

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