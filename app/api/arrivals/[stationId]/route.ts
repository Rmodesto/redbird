import { NextResponse } from "next/server";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import fs from 'fs';
import path from 'path';

// MTA feed URLs for different subway lines
const MTA_FEEDS = {
  'ACE': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'BDFM': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'G': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'JZ': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'NQRW': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'L': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
  '123456': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
  '7': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-7'
};

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  arrivalTime: number;
  minutesUntil: number;
  stopId: string;
}

let stationsData: any[] | null = null;
let stopIdLookup: Record<string, any> | null = null;

function loadStationData() {
  if (!stationsData || !stopIdLookup) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      const stationsPath = path.join(dataDir, 'stations.json');
      const stopIdLookupPath = path.join(dataDir, 'stop-id-lookup.json');
      
      stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      stopIdLookup = JSON.parse(fs.readFileSync(stopIdLookupPath, 'utf8'));
      
    } catch (error) {
      console.error('Error loading station data:', error);
      throw error;
    }
  }
}

function determineRelevantFeeds(lines: string[]): string[] {
  const feeds: string[] = [];
  
  for (const line of lines) {
    if (['A', 'C', 'E'].includes(line)) feeds.push('ACE');
    else if (['B', 'D', 'F', 'M'].includes(line)) feeds.push('BDFM');
    else if (['G'].includes(line)) feeds.push('G');
    else if (['J', 'Z'].includes(line)) feeds.push('JZ');
    else if (['N', 'Q', 'R', 'W'].includes(line)) feeds.push('NQRW');
    else if (['L'].includes(line)) feeds.push('L');
    else if (['1', '2', '3', '4', '5', '6'].includes(line)) feeds.push('123456');
    else if (['7'].includes(line)) feeds.push('7');
  }
  
  return [...new Set(feeds)]; // Remove duplicates
}

function getDestinationFromTrip(tripId: string, routeId: string): string {
  // Extract destination from trip ID or route ID
  // This is simplified - in a real app you'd have a trips database
  const destinations: Record<string, string[]> = {
    'A': ['Far Rockaway', 'Lefferts Blvd', 'Inwood-207 St'],
    'C': ['168 St', 'Euclid Av'],
    'E': ['World Trade Center', 'Jamaica Center'],
    'B': ['Brighton Beach', 'Bedford Park Blvd'],
    'D': ['Coney Island', 'Norwood-205 St'],
    'F': ['Coney Island', 'Jamaica-179 St'],
    'M': ['Metropolitan Av', 'Forest Hills'],
    'G': ['Church Av', 'Court Sq'],
    '1': ['South Ferry', 'Van Cortlandt Park'],
    '2': ['Flatbush Av', 'Wakefield'],
    '3': ['New Lots Av', 'Harlem-148 St'],
    '4': ['Crown Heights', 'Woodlawn'],
    '5': ['Flatbush Av', 'Eastchester'],
    '6': ['Brooklyn Bridge', 'Pelham Bay Park'],
    '7': ['Times Sq', 'Flushing-Main St'],
    'N': ['Coney Island', 'Astoria'],
    'Q': ['Coney Island', '96 St'],
    'R': ['Bay Ridge', '71 Av'],
    'W': ['Whitehall', 'Astoria'],
    'L': ['8 Av', 'Canarsie'],
    'J': ['Broad St', 'Jamaica Center'],
    'Z': ['Broad St', 'Jamaica Center']
  };
  
  const possibleDestinations = destinations[routeId] || ['Unknown'];
  return possibleDestinations[Math.floor(Math.random() * possibleDestinations.length)];
}

async function fetchFeedData(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      console.error(`Feed request failed: ${response.status}`);
      return [];
    }
    
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );
    
    return feed.entity.filter(entity => 
      entity.tripUpdate && 
      entity.tripUpdate.stopTimeUpdate && 
      entity.tripUpdate.stopTimeUpdate.length > 0
    );
    
  } catch (error) {
    console.error('Error fetching feed:', error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { stationId: string } }
) {
  try {
    loadStationData();
    
    const stationId = params.stationId;
    
    if (!stationsData || !stopIdLookup) {
      throw new Error('Station data not loaded');
    }
    
    // Find the station
    const station = stationsData.find(s => s.id === stationId || s.slug === stationId);
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Get all stop IDs for this station
    const stopIds = station.platforms.map((p: any) => p.stopId);
    const stationLines = station.lines;
    
    console.log(`Fetching arrivals for station: ${station.name}`);
    console.log(`Stop IDs: ${stopIds.join(', ')}`);
    console.log(`Lines: ${stationLines.join(', ')}`);
    
    // Determine which feeds to fetch
    const relevantFeeds = determineRelevantFeeds(stationLines);
    console.log(`Relevant feeds: ${relevantFeeds.join(', ')}`);
    
    const arrivals: Arrival[] = [];
    const now = Math.floor(Date.now() / 1000);
    
    // Fetch from all relevant feeds
    for (const feedName of relevantFeeds) {
      const feedUrl = MTA_FEEDS[feedName as keyof typeof MTA_FEEDS];
      if (!feedUrl) continue;
      
      console.log(`Fetching from ${feedName} feed...`);
      const entities = await fetchFeedData(feedUrl);
      
      for (const entity of entities) {
        const tripUpdate = entity.tripUpdate;
        if (!tripUpdate || !tripUpdate.trip) continue;
        
        const routeId = tripUpdate.trip.routeId;
        const destination = getDestinationFromTrip(tripUpdate.trip.tripId || '', routeId || '');
        
        for (const stopTimeUpdate of tripUpdate.stopTimeUpdate || []) {
          const stopId = stopTimeUpdate.stopId;
          
          if (!stopIds.includes(stopId)) continue;
          
          const arrivalTime = stopTimeUpdate.arrival?.time?.low || 
                             stopTimeUpdate.departure?.time?.low;
          
          if (!arrivalTime) continue;
          
          const minutesUntil = Math.max(0, Math.floor((arrivalTime - now) / 60));
          
          // Only show trains arriving in the next 30 minutes
          if (minutesUntil <= 30) {
            const direction = stopId.endsWith('N') ? 'Uptown/Queens' : 
                            stopId.endsWith('S') ? 'Downtown/Brooklyn' : 'Unknown';
            
            arrivals.push({
              line: routeId || 'Unknown',
              direction,
              destination,
              arrivalTime,
              minutesUntil,
              stopId
            });
          }
        }
      }
    }
    
    // Sort by arrival time
    arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    console.log(`Found ${arrivals.length} upcoming arrivals`);
    
    return NextResponse.json({
      station: {
        id: station.id,
        name: station.name,
        slug: station.slug
      },
      arrivals: arrivals.slice(0, 20), // Limit to 20 most immediate arrivals
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in arrivals API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrival data' },
      { status: 500 }
    );
  }
}