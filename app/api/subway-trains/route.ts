import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface SubwayTrain {
  id: string;
  line: string;
  direction: 'N' | 'S' | 'E' | 'W'; // North, South, East, West
  coordinates: [number, number]; // [longitude, latitude]
  destination: string;
  nextStop?: string;
  delay?: number; // minutes
  timestamp: string;
  speed?: number; // mph
}

// NYC Subway Line Colors for reference
const LINE_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183',
};

// Destination mappings for realistic train destinations
const DESTINATIONS = {
  '1': { N: 'Van Cortlandt Park-242 St', S: 'South Ferry' },
  '2': { N: 'Wakefield-241 St', S: 'Flatbush Ave-Brooklyn College' },
  '3': { N: 'Harlem-148 St', S: 'New Lots Ave' },
  '4': { N: 'Woodlawn', S: 'Utica Ave' },
  '5': { N: 'Eastchester-Dyre Ave', S: 'Flatbush Ave-Brooklyn College' },
  '6': { N: 'Pelham Bay Park', S: 'Brooklyn Bridge-City Hall' },
  '7': { E: 'Flushing-Main St', W: '34 St-Hudson Yards' },
  'A': { N: 'Inwood-207 St', S: 'Far Rockaway-Mott Ave' },
  'B': { N: 'Bedford Park Blvd', S: 'Brighton Beach' },
  'C': { N: 'Washington Heights-168 St', S: 'Euclid Ave' },
  'D': { N: 'Norwood-205 St', S: 'Coney Island-Stillwell Ave' },
  'E': { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
  'F': { N: 'Jamaica-179 St', S: 'Coney Island-Stillwell Ave' },
  'G': { N: 'Court Sq', S: 'Church Ave' },
  'J': { N: 'Jamaica Center-Parsons/Archer', S: 'Broad St' },
  'L': { E: 'Canarsie-Rockaway Pkwy', W: '8 Ave' },
  'M': { N: 'Forest Hills-71 Ave', S: 'Metropolitan Ave' },
  'N': { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Ave' },
  'Q': { N: '96 St', S: 'Coney Island-Stillwell Ave' },
  'R': { N: 'Forest Hills-71 Ave', S: 'Bay Ridge-95 St' },
  'W': { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St-South Ferry' },
  'Z': { N: 'Jamaica Center-Parsons/Archer', S: 'Broad St' },
  'S': { N: 'Times Sq-42 St', S: 'Grand Central-42 St' },
};

// Function to generate realistic train positions along routes
function generateTrainPosition(line: string, direction: 'N' | 'S' | 'E' | 'W'): [number, number] {
  const baseCoords = {
    // Manhattan spine coordinates for different lines
    '1': { lat: 40.7589, lng: -73.9851 },
    '2': { lat: 40.7489, lng: -73.9851 },
    '3': { lat: 40.7389, lng: -73.9851 },
    '4': { lat: 40.7589, lng: -73.9766 },
    '5': { lat: 40.7489, lng: -73.9766 },
    '6': { lat: 40.7389, lng: -73.9766 },
    '7': { lat: 40.7527, lng: -73.9400 },
    'A': { lat: 40.7589, lng: -74.0020 },
    'B': { lat: 40.7489, lng: -73.9900 },
    'C': { lat: 40.7389, lng: -74.0020 },
    'D': { lat: 40.7289, lng: -73.9900 },
    'E': { lat: 40.7189, lng: -74.0020 },
    'F': { lat: 40.7089, lng: -73.9900 },
    'G': { lat: 40.6900, lng: -73.9500 },
    'J': { lat: 40.7100, lng: -73.9800 },
    'L': { lat: 40.7300, lng: -73.9800 },
    'M': { lat: 40.7200, lng: -73.9900 },
    'N': { lat: 40.7400, lng: -73.9900 },
    'Q': { lat: 40.7500, lng: -73.9900 },
    'R': { lat: 40.7300, lng: -73.9900 },
    'W': { lat: 40.7600, lng: -73.9900 },
    'Z': { lat: 40.7000, lng: -73.9800 },
    'S': { lat: 40.7550, lng: -73.9850 },
  };

  const base = baseCoords[line as keyof typeof baseCoords] || baseCoords['1'];
  
  // Add some randomness and directional movement
  const latOffset = (Math.random() - 0.5) * 0.02; // ~1 mile variance
  const lngOffset = (Math.random() - 0.5) * 0.02;
  
  // Adjust based on direction
  const directionMultiplier = {
    'N': { lat: 0.01, lng: 0 },
    'S': { lat: -0.01, lng: 0 },
    'E': { lat: 0, lng: 0.01 },
    'W': { lat: 0, lng: -0.01 },
  };

  return [
    base.lng + lngOffset + directionMultiplier[direction].lng,
    base.lat + latOffset + directionMultiplier[direction].lat
  ];
}

// Generate realistic next stops
function getNextStop(line: string, direction: 'N' | 'S' | 'E' | 'W'): string {
  const nextStops = {
    '1': { N: '96 St', S: '42 St-Times Sq' },
    '2': { N: '96 St', S: '42 St-Times Sq' },
    '4': { N: '86 St', S: '59 St-Lex' },
    '5': { N: '86 St', S: '59 St-Lex' },
    '6': { N: '86 St', S: '59 St-Lex' },
    '7': { E: 'Queens Plaza', W: 'Times Sq-42 St' },
    'A': { N: '59 St-Columbus Circle', S: '34 St-Penn Station' },
    'B': { N: '47-50 Sts-Rockefeller Ctr', S: 'Atlantic Ave-Barclays' },
    'D': { N: '47-50 Sts-Rockefeller Ctr', S: 'Atlantic Ave-Barclays' },
    'F': { N: '47-50 Sts-Rockefeller Ctr', S: 'Jay St-MetroTech' },
    'L': { E: '14 St-1 Ave', W: '14 St-Union Sq' },
    'N': { N: '42 St-Times Sq', S: 'Canal St' },
    'Q': { N: '42 St-Times Sq', S: 'Canal St' },
    'R': { N: '42 St-Times Sq', S: 'Canal St' },
    'W': { N: '42 St-Times Sq', S: 'Canal St' },
  };

  return nextStops[line as keyof typeof nextStops]?.[direction as keyof typeof nextStops[keyof typeof nextStops]] || 'Next Station';
}

// Cache for trains to simulate movement
let trainCache: SubwayTrain[] = [];
let lastUpdate = 0;

function generateTrains(): SubwayTrain[] {
  const now = Date.now();
  
  // Update trains every 30 seconds
  if (trainCache.length > 0 && now - lastUpdate < 30000) {
    return trainCache;
  }

  const lines = Object.keys(DESTINATIONS);
  const trains: SubwayTrain[] = [];
  
  lines.forEach(line => {
    // Generate 2-8 trains per line depending on service frequency
    const trainCount = line === 'L' ? 4 : Math.floor(Math.random() * 6) + 2;
    
    for (let i = 0; i < trainCount; i++) {
      const direction = Math.random() > 0.5 ? 'N' : (['7', 'L'].includes(line) ? (Math.random() > 0.5 ? 'E' : 'W') : 'S');
      const destinations = DESTINATIONS[line as keyof typeof DESTINATIONS];
      
      if (!destinations) continue;
      
      const train: SubwayTrain = {
        id: `${line}-${direction}-${i}`,
        line,
        direction: direction as 'N' | 'S' | 'E' | 'W',
        coordinates: generateTrainPosition(line, direction as 'N' | 'S' | 'E' | 'W'),
        destination: destinations[direction as keyof typeof destinations] || 'Terminal',
        nextStop: getNextStop(line, direction as 'N' | 'S' | 'E' | 'W'),
        delay: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : undefined,
        timestamp: new Date().toISOString(),
        speed: Math.floor(Math.random() * 30) + 15, // 15-45 mph
      };
      
      trains.push(train);
    }
  });

  trainCache = trains;
  lastUpdate = now;
  
  return trains;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lines = searchParams.get('lines')?.split(',') || [];
  
  let trains = generateTrains();
  
  // Filter by lines if specified
  if (lines.length > 0 && !lines.includes('all')) {
    trains = trains.filter(train => lines.includes(train.line));
  }
  
  const response = NextResponse.json({
    trains,
    total: trains.length,
    timestamp: new Date().toISOString(),
    nextUpdate: new Date(Date.now() + 30000).toISOString(),
  });
  
  // Cache for 10 seconds to simulate real-time updates
  response.headers.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=60');
  
  return response;
}

// Optional: Add a POST endpoint to simulate train movement updates
export async function POST(request: Request) {
  const { trainId, coordinates } = await request.json();
  
  // Update specific train position (for future real-time integration)
  const trainIndex = trainCache.findIndex(train => train.id === trainId);
  if (trainIndex !== -1) {
    trainCache[trainIndex].coordinates = coordinates;
    trainCache[trainIndex].timestamp = new Date().toISOString();
  }
  
  return NextResponse.json({ success: true });
}