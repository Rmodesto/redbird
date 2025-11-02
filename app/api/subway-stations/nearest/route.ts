import { NextResponse } from 'next/server';
import stationsData from '@/data/nyc-subway-stations-official.json';
import type { SubwayStation } from '@/app/api/subway-stations/route';

export const dynamic = 'force-dynamic';

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const limit = parseInt(searchParams.get('limit') || '5');
  const lines = searchParams.get('lines')?.split(',') || [];

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Get all stations
  let stations: SubwayStation[] = stationsData.stations.map(station => ({
    ...station,
    coordinates: station.coordinates as [number, number]
  }));

  // Filter by subway lines if specified
  if (lines.length > 0 && !lines.includes('all')) {
    stations = stations.filter(station =>
      station.lines.some(line => lines.includes(line))
    );
  }

  // Calculate distances and sort by proximity
  const stationsWithDistance = stations.map(station => ({
    ...station,
    distance: calculateDistance(
      lat,
      lon,
      station.coordinates[1], // latitude
      station.coordinates[0]  // longitude
    )
  }));

  // Sort by distance and limit results
  const nearestStations = stationsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  const response = NextResponse.json({
    query: { latitude: lat, longitude: lon, limit },
    stations: nearestStations,
    total: nearestStations.length,
    timestamp: new Date().toISOString(),
  });

  // Cache for 5 minutes since location-based searches can be frequent
  response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=1800');
  
  return response;
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Geocode the address using a simple approach
    // In production, you'd want to use a proper geocoding service
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', New York, NY')}&limit=1`
    );
    
    if (!geocodeResponse.ok) {
      throw new Error('Geocoding failed');
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    const { lat, lon } = geocodeData[0];
    
    // Use the same logic as GET endpoint
    const stations: SubwayStation[] = stationsData.stations.map(station => ({
      ...station,
      coordinates: station.coordinates as [number, number]
    }));

    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: calculateDistance(
        parseFloat(lat),
        parseFloat(lon),
        station.coordinates[1],
        station.coordinates[0]
      )
    }));

    const nearestStations = stationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    const response = NextResponse.json({
      query: { address, latitude: parseFloat(lat), longitude: parseFloat(lon) },
      stations: nearestStations,
      total: nearestStations.length,
      timestamp: new Date().toISOString(),
    });

    response.headers.set('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
    
    return response;
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}