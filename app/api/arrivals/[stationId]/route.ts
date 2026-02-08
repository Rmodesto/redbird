import { NextResponse } from "next/server";

// Import JSON directly so Next.js bundles them (works in serverless)
import stationsNormalized from '@/data/stations-normalized.json';
import stopIdLookupData from '@/data/stop-id-lookup.json';

export const dynamic = 'force-dynamic';

// Cloudflare Worker URL for protobuf decoding
const WORKER_URL = 'https://mta-gtfs-proxy.subwaysounds.workers.dev';

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  arrivalTime: number;
  minutesUntil: number;
  stopId: string;
  tripId: string;
}

// Build slug -> stopIds mapping at module load time
const slugToStopIds: Record<string, string[]> = {};
for (const [stopId, info] of Object.entries(stopIdLookupData as Record<string, any>)) {
  const slug = info.stationSlug;
  if (slug) {
    if (!slugToStopIds[slug]) {
      slugToStopIds[slug] = [];
    }
    slugToStopIds[slug].push(stopId);
  }
}

// Process stations data at module load time
const stationsData = stationsNormalized.map((station: any) => ({
  id: station.id,
  name: station.name,
  slug: station.slug,
  lines: station.lines || [],
}));

console.log(`Loaded ${stationsData.length} stations, ${Object.keys(slugToStopIds).length} slug mappings`);

function determineRelevantFeeds(lines: string[]): string[] {
  const feeds: string[] = [];

  for (const line of lines) {
    if (['A', 'C', 'E'].includes(line)) feeds.push('ACE');
    else if (['B', 'D', 'F', 'M'].includes(line)) feeds.push('BDFM');
    else if (['G'].includes(line)) feeds.push('G');
    else if (['J', 'Z'].includes(line)) feeds.push('JZ');
    else if (['N', 'Q', 'R', 'W'].includes(line)) feeds.push('NQRW');
    else if (['L'].includes(line)) feeds.push('L');
    else if (['1', '2', '3', '4', '5', '6', '7', 'S', 'GS'].includes(line)) feeds.push('1234567S');
  }

  return Array.from(new Set(feeds));
}

function getDestination(routeId: string, direction: string): string {
  const destinations: Record<string, { uptown: string; downtown: string }> = {
    '1': { uptown: 'Van Cortlandt Park-242 St', downtown: 'South Ferry' },
    '2': { uptown: 'Wakefield-241 St', downtown: 'Flatbush Av-Brooklyn College' },
    '3': { uptown: 'Harlem-148 St', downtown: 'New Lots Av' },
    '4': { uptown: 'Woodlawn', downtown: 'Crown Heights-Utica Av' },
    '5': { uptown: 'Eastchester-Dyre Av', downtown: 'Flatbush Av-Brooklyn College' },
    '6': { uptown: 'Pelham Bay Park', downtown: 'Brooklyn Bridge-City Hall' },
    '7': { uptown: 'Flushing-Main St', downtown: 'Times Square-42 St' },
    'A': { uptown: 'Inwood-207 St', downtown: 'Far Rockaway' },
    'C': { uptown: '168 St', downtown: 'Euclid Av' },
    'E': { uptown: 'Jamaica Center', downtown: 'World Trade Center' },
    'B': { uptown: 'Bedford Park Blvd', downtown: 'Brighton Beach' },
    'D': { uptown: 'Norwood-205 St', downtown: 'Coney Island-Stillwell Av' },
    'F': { uptown: 'Jamaica-179 St', downtown: 'Coney Island-Stillwell Av' },
    'M': { uptown: 'Forest Hills-71 Av', downtown: 'Metropolitan Av' },
    'G': { uptown: 'Court Sq', downtown: 'Church Av' },
    'N': { uptown: 'Astoria-Ditmars Blvd', downtown: 'Coney Island-Stillwell Av' },
    'Q': { uptown: '96 St', downtown: 'Coney Island-Stillwell Av' },
    'R': { uptown: 'Forest Hills-71 Av', downtown: 'Bay Ridge-95 St' },
    'W': { uptown: 'Astoria-Ditmars Blvd', downtown: 'Whitehall St-South Ferry' },
    'L': { uptown: '8 Av', downtown: 'Canarsie-Rockaway Pkwy' },
    'J': { uptown: 'Jamaica Center', downtown: 'Broad St' },
    'Z': { uptown: 'Jamaica Center', downtown: 'Broad St' },
    'GS': { uptown: 'Grand Central-42 St', downtown: 'Times Sq-42 St' },
    'S': { uptown: 'Grand Central-42 St', downtown: 'Times Sq-42 St' },
  };

  const dest = destinations[routeId];
  if (!dest) return 'Unknown';

  const isUptown = direction === 'Uptown' || direction.includes('N');
  return isUptown ? dest.uptown : dest.downtown;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stationId: string }> }
) {
  try {
    const { stationId } = await params;

    if (!stationId || typeof stationId !== 'string' || stationId.trim().length === 0) {
      return NextResponse.json({ error: 'Station ID is required' }, { status: 400 });
    }

    // Find the station
    const station = stationsData.find(s => s.id === stationId || s.slug === stationId);

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    // Get stop IDs for this station
    let stopIds: string[] = slugToStopIds[station.slug] || [];

    if (stopIds.length === 0) {
      console.log(`No stop IDs found for station: ${station.name}`);
      return NextResponse.json({
        station: { id: station.id, name: station.name, slug: station.slug },
        arrivals: [],
        lastUpdated: new Date().toISOString(),
        debug: { error: 'No stop IDs mapped for this station' }
      });
    }

    // Determine feeds to query
    const feeds = determineRelevantFeeds(station.lines);

    console.log(`Fetching arrivals for ${station.name}: stops=${stopIds.join(',')}, feeds=${feeds.join(',')}`);

    // Call Cloudflare Worker
    const workerUrl = `${WORKER_URL}/arrivals?stops=${stopIds.join(',')}&feeds=${feeds.join(',')}`;

    const workerResponse = await fetch(workerUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!workerResponse.ok) {
      throw new Error(`Worker returned ${workerResponse.status}`);
    }

    const workerData = await workerResponse.json() as {
      arrivals: Array<{
        routeId: string;
        tripId: string;
        stopId: string;
        arrivalTime: number;
        minutesUntil: number;
      }>;
      timestamp: number;
    };

    // Transform worker response to our format
    const arrivals: Arrival[] = workerData.arrivals.map(a => {
      const direction = a.stopId.endsWith('N') ? 'Uptown' : 'Downtown';
      return {
        line: a.routeId,
        direction,
        destination: getDestination(a.routeId, direction),
        arrivalTime: a.arrivalTime,
        minutesUntil: a.minutesUntil,
        stopId: a.stopId,
        tripId: a.tripId,
      };
    });

    // Limit to 3 per line-direction
    const limited: Arrival[] = [];
    const counts: Record<string, number> = {};

    for (const arrival of arrivals) {
      const key = `${arrival.line}-${arrival.direction}`;
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] <= 3) {
        limited.push(arrival);
      }
    }

    return NextResponse.json({
      station: { id: station.id, name: station.name, slug: station.slug },
      arrivals: limited.slice(0, 15),
      lastUpdated: new Date().toISOString(),
      debug: {
        workerTimestamp: workerData.timestamp,
        rawCount: workerData.arrivals.length,
        finalCount: limited.length,
        stopIds,
        feeds,
      }
    });

  } catch (error) {
    console.error('Error in arrivals API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrival data', details: String(error) },
      { status: 500 }
    );
  }
}
