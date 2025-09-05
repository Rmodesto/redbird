import { NextResponse } from 'next/server';
import stationsData from '@/data/nyc-subway-stations-official.json';

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

interface CrimeData {
  cmplnt_num: string;
  boro_nm: string;
  cmplnt_fr_dt: string;
  ofns_desc: string;
  law_cat_cd: string;
  prem_typ_desc: string;
  latitude: string;
  longitude: string;
}

interface RatData {
  unique_key: string;
  created_date: string;
  borough: string;
  incident_address: string;
  descriptor: string;
  latitude: string;
  longitude: string;
}

async function fetchNearbyData(lat: number, lon: number, radiusMiles: number = 0.25) {
  const promises = [];
  
  // Fetch recent crime data within radius
  const crimeQuery = `
    https://data.cityofnewyork.us/resource/5uac-w243.json?
    $where=latitude IS NOT NULL 
    AND longitude IS NOT NULL 
    AND latitude != '0' 
    AND longitude != '0' 
    AND cmplnt_fr_dt >= '2024-01-01T00:00:00'
    &$limit=1000
  `.replace(/\s+/g, '');
  
  promises.push(
    fetch(crimeQuery)
      .then(res => res.json())
      .catch(() => [])
  );

  // Fetch recent rat sightings within radius  
  const ratQuery = `
    https://data.cityofnewyork.us/resource/3q43-55fe.json?
    $where=latitude IS NOT NULL 
    AND longitude IS NOT NULL 
    AND created_date >= '2024-01-01T00:00:00'
    &$limit=1000
  `.replace(/\s+/g, '');
  
  promises.push(
    fetch(ratQuery)
      .then(res => res.json())
      .catch(() => [])
  );

  const [crimeData, ratData] = await Promise.all(promises);
  
  // Filter data within radius
  const nearbyCrimes = (crimeData as CrimeData[]).filter(crime => {
    const crimeLat = parseFloat(crime.latitude);
    const crimeLon = parseFloat(crime.longitude);
    if (!crimeLat || !crimeLon || crimeLat === 0 || crimeLon === 0) return false;
    
    const distance = calculateDistance(lat, lon, crimeLat, crimeLon);
    return distance <= radiusMiles;
  });

  const nearbyRats = (ratData as RatData[]).filter(rat => {
    const ratLat = parseFloat(rat.latitude);
    const ratLon = parseFloat(rat.longitude);
    if (!ratLat || !ratLon) return false;
    
    const distance = calculateDistance(lat, lon, ratLat, ratLon);
    return distance <= radiusMiles;
  });

  return { crimes: nearbyCrimes, rats: nearbyRats };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('station');
  const radius = parseFloat(searchParams.get('radius') || '0.25');
  
  if (!stationId) {
    return NextResponse.json(
      { error: 'Station ID is required' },
      { status: 400 }
    );
  }

  // Find the station
  const station = stationsData.stations.find(s => s.id === stationId);
  
  if (!station) {
    return NextResponse.json(
      { error: 'Station not found' },
      { status: 404 }
    );
  }

  try {
    const [stationLon, stationLat] = station.coordinates;
    const { crimes, rats } = await fetchNearbyData(stationLat, stationLon, radius);
    
    // Analyze crime types
    const crimeStats = {
      total: crimes.length,
      felonies: crimes.filter(c => c.law_cat_cd === 'FELONY').length,
      misdemeanors: crimes.filter(c => c.law_cat_cd === 'MISDEMEANOR').length,
      violations: crimes.filter(c => c.law_cat_cd === 'VIOLATION').length,
      byType: crimes.reduce((acc: Record<string, number>, crime) => {
        const type = crime.ofns_desc || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      recent: crimes
        .sort((a, b) => new Date(b.cmplnt_fr_dt).getTime() - new Date(a.cmplnt_fr_dt).getTime())
        .slice(0, 5)
        .map(crime => ({
          date: crime.cmplnt_fr_dt,
          type: crime.ofns_desc,
          category: crime.law_cat_cd,
          location: crime.prem_typ_desc
        }))
    };

    // Analyze rat data
    const ratStats = {
      total: rats.length,
      recent: rats
        .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
        .slice(0, 5)
        .map(rat => ({
          date: rat.created_date,
          address: rat.incident_address,
          borough: rat.borough
        }))
    };

    // Calculate safety score (inverse of crime density)
    const totalPopulation = crimes.length + rats.length;
    const crimeWeight = crimes.length * 2; // Weight crimes more heavily
    const ratWeight = rats.length * 0.5; // Rats are less serious
    const rawScore = Math.max(0, 100 - (crimeWeight + ratWeight));
    const safetyScore = Math.round(rawScore);

    const response = NextResponse.json({
      station: {
        id: station.id,
        name: station.name,
        borough: station.borough,
        coordinates: station.coordinates
      },
      searchRadius: radius,
      timestamp: new Date().toISOString(),
      safetyScore,
      crimeStats,
      ratStats,
      summary: {
        totalIncidents: totalPopulation,
        riskLevel: safetyScore >= 80 ? 'Low' : safetyScore >= 60 ? 'Medium' : safetyScore >= 40 ? 'High' : 'Very High'
      }
    });

    // Cache for 1 hour since this data doesn't change frequently
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');
    
    return response;
    
  } catch (error) {
    console.error('Error fetching station stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station statistics' },
      { status: 500 }
    );
  }
}

// Get stats for multiple stations
export async function POST(request: Request) {
  try {
    const { stationIds, radius = 0.25 } = await request.json();
    
    if (!Array.isArray(stationIds) || stationIds.length === 0) {
      return NextResponse.json(
        { error: 'Station IDs array is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      stationIds.map(async (stationId: string) => {
        const station = stationsData.stations.find(s => s.id === stationId);
        if (!station) return null;

        try {
          const [stationLon, stationLat] = station.coordinates;
          const { crimes, rats } = await fetchNearbyData(stationLat, stationLon, radius);
          
          const crimeWeight = crimes.length * 2;
          const ratWeight = rats.length * 0.5;
          const safetyScore = Math.round(Math.max(0, 100 - (crimeWeight + ratWeight)));

          return {
            stationId: station.id,
            name: station.name,
            borough: station.borough,
            safetyScore,
            totalCrimes: crimes.length,
            totalRats: rats.length,
            riskLevel: safetyScore >= 80 ? 'Low' : safetyScore >= 60 ? 'Medium' : safetyScore >= 40 ? 'High' : 'Very High'
          };
        } catch (error) {
          return null;
        }
      })
    );

    const validResults = results.filter(Boolean);

    const response = NextResponse.json({
      results: validResults,
      total: validResults.length,
      timestamp: new Date().toISOString(),
    });

    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');
    
    return response;
    
  } catch (error) {
    console.error('Error fetching multiple station stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station statistics' },
      { status: 500 }
    );
  }
}