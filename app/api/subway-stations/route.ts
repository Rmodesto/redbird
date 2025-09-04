import { NextResponse } from 'next/server';

export interface SubwayStation {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number]; // [longitude, latitude]
  borough: string;
  complex?: boolean;
}

// Major NYC Subway Stations with authentic coordinates and line information
const SUBWAY_STATIONS: SubwayStation[] = [
  // Manhattan - Midtown
  {
    id: 'times-square-42',
    name: 'Times Square-42 St',
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
    coordinates: [-73.9873, 40.7550],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: 'grand-central-42',
    name: 'Grand Central-42 St',
    lines: ['4', '5', '6', '7', 'S'],
    coordinates: [-73.9766, 40.7527],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: 'herald-square-34',
    name: '34th St-Herald Sq',
    lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9879, 40.7497],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: 'penn-station-34',
    name: '34th St-Penn Station',
    lines: ['1', '2', '3'],
    coordinates: [-73.9912, 40.7505],
    borough: 'Manhattan',
  },
  {
    id: 'union-square-14',
    name: '14th St-Union Sq',
    lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9906, 40.7359],
    borough: 'Manhattan',
    complex: true,
  },

  // Manhattan - Upper East Side
  {
    id: '59-lex-nqrw',
    name: '59th St-Lexington Ave',
    lines: ['4', '5', '6', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9680, 40.7625],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: '86-lex',
    name: '86th St',
    lines: ['4', '5', '6'],
    coordinates: [-73.9558, 40.7795],
    borough: 'Manhattan',
  },
  {
    id: '125-lex',
    name: '125th St',
    lines: ['4', '5', '6'],
    coordinates: [-73.9370, 40.8044],
    borough: 'Manhattan',
  },

  // Manhattan - Upper West Side
  {
    id: '59-columbus',
    name: '59th St-Columbus Circle',
    lines: ['1', '2', 'A', 'B', 'C', 'D'],
    coordinates: [-73.9818, 40.7681],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: '72-broadway',
    name: '72nd St',
    lines: ['1', '2', '3'],
    coordinates: [-73.9819, 40.7781],
    borough: 'Manhattan',
  },
  {
    id: '96-broadway',
    name: '96th St',
    lines: ['1', '2', '3'],
    coordinates: [-73.9726, 40.7934],
    borough: 'Manhattan',
  },
  {
    id: '125-broadway',
    name: '125th St',
    lines: ['1'],
    coordinates: [-73.9583, 40.8158],
    borough: 'Manhattan',
  },

  // Manhattan - Downtown
  {
    id: 'fulton-st',
    name: 'Fulton St',
    lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'],
    coordinates: [-74.0097, 40.7105],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: 'wall-st',
    name: 'Wall St',
    lines: ['4', '5'],
    coordinates: [-74.0113, 40.7074],
    borough: 'Manhattan',
  },
  {
    id: 'bowling-green',
    name: 'Bowling Green',
    lines: ['4', '5'],
    coordinates: [-74.0142, 40.7049],
    borough: 'Manhattan',
  },
  {
    id: 'world-trade-center',
    name: 'World Trade Center',
    lines: ['E'],
    coordinates: [-74.0120, 40.7126],
    borough: 'Manhattan',
  },

  // Manhattan - East Village/LES
  {
    id: '14-1st-ave',
    name: '14th St-1st Ave',
    lines: ['L'],
    coordinates: [-73.9818, 40.7308],
    borough: 'Manhattan',
  },
  {
    id: 'astor-place',
    name: 'Astor Pl',
    lines: ['6'],
    coordinates: [-73.9916, 40.7302],
    borough: 'Manhattan',
  },
  {
    id: 'delancey-essex',
    name: 'Delancey St-Essex St',
    lines: ['F', 'M', 'J', 'Z'],
    coordinates: [-73.9878, 40.7184],
    borough: 'Manhattan',
    complex: true,
  },

  // Brooklyn
  {
    id: 'atlantic-ave-barclays',
    name: 'Atlantic Ave-Barclays Ctr',
    lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9766, 40.6840],
    borough: 'Brooklyn',
    complex: true,
  },
  {
    id: 'prospect-park',
    name: 'Prospect Park',
    lines: ['B', 'Q'],
    coordinates: [-73.9619, 40.6616],
    borough: 'Brooklyn',
  },
  {
    id: 'coney-island-stillwell',
    name: 'Coney Island-Stillwell Ave',
    lines: ['D', 'F', 'N', 'Q'],
    coordinates: [-73.9814, 40.5773],
    borough: 'Brooklyn',
    complex: true,
  },
  {
    id: 'williamsburg-bridge',
    name: 'Marcy Ave',
    lines: ['J', 'Z'],
    coordinates: [-73.9578, 40.7081],
    borough: 'Brooklyn',
  },
  {
    id: 'dekalb-ave',
    name: 'DeKalb Ave',
    lines: ['B', 'Q', 'R'],
    coordinates: [-73.9816, 40.6906],
    borough: 'Brooklyn',
  },

  // Queens
  {
    id: 'queensboro-plaza',
    name: 'Queensboro Plaza',
    lines: ['7', 'N', 'W'],
    coordinates: [-73.9401, 40.7505],
    borough: 'Queens',
    complex: true,
  },
  {
    id: 'jackson-heights',
    name: 'Jackson Hts-Roosevelt Ave',
    lines: ['7', 'E', 'F', 'M', 'R'],
    coordinates: [-73.8914, 40.7467],
    borough: 'Queens',
    complex: true,
  },
  {
    id: 'flushing-main',
    name: 'Flushing-Main St',
    lines: ['7'],
    coordinates: [-73.8303, 40.7596],
    borough: 'Queens',
  },
  {
    id: 'forest-hills',
    name: 'Forest Hills-71 Ave',
    lines: ['E', 'F', 'M', 'R'],
    coordinates: [-73.8448, 40.7217],
    borough: 'Queens',
  },
  {
    id: 'jamaica-center',
    name: 'Jamaica Center-Parsons/Archer',
    lines: ['E', 'J', 'Z'],
    coordinates: [-73.8018, 40.7024],
    borough: 'Queens',
    complex: true,
  },

  // Bronx
  {
    id: '125-st-4-5-6',
    name: '125th St',
    lines: ['4', '5', '6'],
    coordinates: [-73.9370, 40.8044],
    borough: 'Bronx',
  },
  {
    id: 'yankee-stadium',
    name: '161st St-Yankee Stadium',
    lines: ['4', 'B', 'D'],
    coordinates: [-73.9257, 40.8276],
    borough: 'Bronx',
    complex: true,
  },
  {
    id: 'fordham',
    name: 'Fordham Rd',
    lines: ['4', 'B', 'D'],
    coordinates: [-73.9010, 40.8617],
    borough: 'Bronx',
  },
  {
    id: 'bronx-whitestone',
    name: 'Whitestone-Bronx',
    lines: ['6'],
    coordinates: [-73.8094, 40.7947],
    borough: 'Bronx',
  },

  // Key Transfer Stations
  {
    id: 'west-4th',
    name: 'W 4th St-Washington Sq',
    lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'],
    coordinates: [-74.0006, 40.7323],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: '42-port-authority',
    name: '42nd St-Port Authority Bus Terminal',
    lines: ['A', 'C', 'E', '1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
    coordinates: [-73.9899, 40.7570],
    borough: 'Manhattan',
    complex: true,
  },
  {
    id: 'jay-st-metrotech',
    name: 'Jay St-MetroTech',
    lines: ['A', 'C', 'F', 'R'],
    coordinates: [-73.9878, 40.6924],
    borough: 'Brooklyn',
    complex: true,
  },

  // L Train Corridor
  {
    id: 'bedford-ave',
    name: 'Bedford Ave',
    lines: ['L'],
    coordinates: [-73.9570, 40.7170],
    borough: 'Brooklyn',
  },
  {
    id: 'lorimer-st',
    name: 'Lorimer St',
    lines: ['L'],
    coordinates: [-73.9477, 40.7140],
    borough: 'Brooklyn',
  },
  {
    id: 'graham-ave',
    name: 'Graham Ave',
    lines: ['L'],
    coordinates: [-73.9440, 40.7146],
    borough: 'Brooklyn',
  },

  // Express Stations
  {
    id: '59-lex-456',
    name: '59th St-Lexington Ave',
    lines: ['4', '5', '6'],
    coordinates: [-73.9680, 40.7625],
    borough: 'Manhattan',
  },
  {
    id: 'canal-st-456',
    name: 'Canal St',
    lines: ['4', '5', '6'],
    coordinates: [-73.9991, 40.7190],
    borough: 'Manhattan',
  },
  {
    id: 'canal-st-nqrw',
    name: 'Canal St',
    lines: ['N', 'Q', 'R', 'W'],
    coordinates: [-74.0038, 40.7193],
    borough: 'Manhattan',
  },
];

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