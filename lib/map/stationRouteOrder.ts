// Define the correct station order for each subway line
// This ensures lines are drawn following actual routes, not random connections

export const LINE_STATION_ORDER: Record<string, string[]> = {
  // E Line - 8th Avenue Local (Queens to Manhattan) - Using exact station names from data
  'E': [
    'Jamaica Ctr - Parsons / Archer',
    'Sutphin Blvd - Archer Av',
    'Jamaica - Van Wyck',
    'Briarwood - Van Wyck Blvd',
    'Kew Gardens - Union Tpke',
    'Forest Hills - 71st Av',
    '75th Ave',
    'Woodhaven Blvd - Queens Mall',
    '67th Ave',
    '63rd Dr - Rego Park',
    'Grand Ave - Newtown',
    'Elmhurst Ave',
    'Jackson Hts - Roosevelt Av',
    'Northern Blvd',
    '65th St',
    'Steinway St',
    '46th St',
    '36th St',
    'Queens Plz',
    '23rd St - Ely Av',
    'Lexington Ave - 53rd St',
    '5th Ave - 53rd St',
    '42nd St - Port Authority Bus Term',
    '34th St - Penn Station',
    'W 4th St - Washington Sq (Upper)',
    'Spring St',
    'Canal St - Holland Tunnel',
    'World Trade Center'
  ],
  
  // A Line - 8th Avenue Express (Manhattan to Brooklyn/Queens)
  'A': [
    'Inwood - 207th St',
    '190th St',
    '175th St',
    '163rd St - Amsterdam Av',
    'Cathedral Pkwy (110th St)',
    '81st St',
    '42nd St - Port Authority Bus Term',
    '34th St - Penn Station',
    'W 4th St - Washington Sq (Upper)',
    'Canal St - Holland Tunnel',
    'Chambers St',
    'Broadway - Nassau St',
    'High St',
    'Jay St - Borough Hall',
    'Hoyt - Schermerhorn Sts',
    'Nostrand Ave',
    'Utica Ave',
    'Ralph Ave',
    'Rockaway Ave',
    'Liberty Ave',
    'Grant Ave',
    '80th St',
    '88th St',
    'Rockaway Blvd',
    'Aqueduct - North Conduit Av',
    'Howard Beach - JFK Airport',
    'Broad Channel',
    'Beach 90th St',
    'Beach 98th St',
    'Beach 105th St',
    'Rockaway Park - Beach 116 St'
  ],
  
  // C Line - 8th Avenue Local (Manhattan to Brooklyn) - Basic route with Penn Station
  'C': [
    '163rd St - Amsterdam Av',
    'Cathedral Pkwy (110th St)',
    '81st St',
    '42nd St - Port Authority Bus Term',
    '34th St - Penn Station',
    'W 4th St - Washington Sq (Upper)',
    'Canal St - Holland Tunnel',
    'Chambers St',
    'High St',
    'Jay St - Borough Hall',
    'Hoyt - Schermerhorn Sts'
  ],
  
  // 1 Line - Broadway-7th Avenue Local
  '1': [
    'Van Cortlandt Park - 242 St',
    '238 St',
    '231 St',
    'Marble Hill - 225 St',
    '215 St',
    '207 St',
    'Dyckman St',
    '191 St',
    '181 St',
    '168 St - Washington Hts',
    '157 St',
    '145th St - Broadway',
    '137 St - City College',
    '125th St - Broadway',
    '116 St - Columbia University',
    '103rd St - Broadway',
    '96th St - Broadway',
    '86th St - Broadway',
    '79 St',
    '72 St',
    '66 St - Lincoln Center',
    '59 St - Columbus Circle',
    '50 St',
    'Times Sq - 42 St',
    '34 St - Penn Station',
    '28 St',
    '23 St',
    '18 St',
    '14th St - 6th Ave',
    'Christopher St - Sheridan Sq',
    'Houston St',
    'Canal St',
    'Franklin St',
    'Chambers St',
    'Cortlandt St',
    'Rector St',
    'South Ferry'
  ],
  
  // 4 Line - Lexington Avenue Express (Bronx to Manhattan to Brooklyn) - Using exact station names
  '4': [
    'Woodlawn',
    'Mosholu Pkwy',
    'Bedford Park Blvd - Lehman College',
    'Kingsbridge Rd',
    'Burnside Ave',
    '183rd St',
    '176th St',
    'Mt Eden Ave',
    '167th St',
    '161st St - Yankee Stadium',
    '149th St - Grand Concourse',
    '138th St - Grand Concourse',
    '110th St',
    '96th St - Lexington Ave',
    '77th St',
    '68th St - Hunter College',
    'Lexington Ave - 59th St',
    '51st St',
    '33rd St',
    '23rd St',
    'Union Sq - 14th St',
    'Astor Pl',
    'Bleecker St (Downtown)',
    'Brooklyn Bridge - City Hall',
    'Wall St',
    'Bowling Green',
    'Borough Hall',
    'Nevins St',
    'Atlantic Ave',
    'Bergen St',
    'Grand Army Plaza',
    'Eastern Pkwy - Bklyn Museum',
    'Franklin Ave',
    'Crown Hts - Utica Ave',
    'Kingston Ave',
    'Sutter Ave - Rutland Road',
    'Saratoga Ave',
    'Junius St',
    'Pennsylvania Ave',
    'Van Siclen Ave',
    'New Lots Ave'
  ],
  
  // 6 Line - Lexington Avenue Local (Bronx to Manhattan)
  '6': [
    'Pelham Bay Park',
    'Buhre Ave',
    'Middletown Rd',
    'Westchester Sq - E Tremont Ave',
    'Zerega Ave',
    'Castle Hill Ave',
    'Parkchester',
    'St Lawrence Ave',
    'Morrison Av - Soundview',
    'Elder Ave',
    'Whitlock Ave',
    'Hunts Point Ave',
    'Longwood Ave',
    'E 149th St',
    'E 143rd St - St Mary\'s St',
    'Cypress Ave',
    'Brook Ave',
    '3rd Ave - 138th St',
    '110th St',
    '96th St - Lexington Ave',
    '77th St',
    '68th St - Hunter College',
    'Lexington Ave - 59th St',
    '51st St',
    '33rd St',
    '23rd St',
    'Union Sq - 14th St',
    'Astor Pl',
    'Bleecker St (Downtown)',
    'Brooklyn Bridge - City Hall'
  ],
  
  // 7 Line - Flushing Express/Local (Queens to Manhattan) - Complete route with Hudson Yards
  '7': [
    'Flushing - Main St',
    'Mets - Willets Point', 
    '111th St',
    '103rd St - Corona Plaza',
    'Junction Blvd',
    '90th St - Elmhurst Av',
    '82nd St - Jackson Hts',
    '74th St - Broadway',
    '69th St',
    'Woodside - 61st St',
    '52nd St',
    '40th St',
    '45th Rd - Court House Sq',
    'Queensboro Plz',
    'Hunters Point Ave',
    'Vernon Blvd - Jackson Ave',
    'Grand Central - 42nd St',
    '5th Ave - Bryant Pk',
    'Times Sq - 42nd St',
    '34th St - Hudson Yards'
  ],
  
  // L Line - 14th Street-Canarsie Local (Manhattan to Brooklyn)
  'L': [
    '8th Ave',
    '6th Ave',
    'Union Sq - 14th St',
    '3rd Ave',
    '1st Ave',
    'Bedford Ave',
    'Lorimer St',
    'Graham Ave',
    'Grand St',
    'Montrose Ave',
    'Morgan Ave',
    'Jefferson St',
    'Myrtle Ave',
    'Halsey St',
    'Wilson Ave',
    'Bushwick - Aberdeen',
    'Sutter Ave',
    'Livonia Ave',
    'E 105th St',
    'Canarsie - Rockaway Pkwy'
  ],
  
  // N Line - Broadway Express (Astoria to Coney Island)
  'N': [
    'Astoria - Ditmars Blvd',
    'Astoria Blvd',
    '30th Ave',
    '36th Ave',
    '39th Ave',
    'Queensboro Plz',
    '5th Ave - 59th St',
    '49th St',
    'Herald Sq - 34th St',
    '28th St',
    '8th St - NYU',
    'Prince St',
    'City Hall',
    'Cortlandt St (NB only)',
    'Rector St',
    'Whitehall St',
    'Court St',
    'Lawrence St',
    'DeKalb Ave',
    'Atlantic Av - Pacific St',
    'Union St',
    '9th St',
    '25th St',
    '45th St',
    '53rd St',
    '59th St',
    '8th Ave',
    'New Utrecht Ave',
    '20th Ave',
    'Gravesend - 86th St',
    'Coney Island - Stillwell Av'
  ],
  
  // M Line - 6th Avenue Local (Queens to Manhattan to Brooklyn)
  'M': [
    'Middle Village - Metropolitan Ave',
    'Fresh Pond Rd',
    'Forest Ave',
    'Seneca Ave',
    'Wyckoff Ave',
    'Knickerbocker Ave',
    'Central Ave',
    'Hewes St',
    'Marcy Ave',
    'Essex St',
    'Broadway - Lafayette St',
    'W 4th St - Washington Sq (Lower)',
    '47th-50th Sts - Rockefeller Ctr',
    '42nd St - Bryant Pk',
    'Lexington Ave - 53rd St',
    '5th Ave - 53rd St',
    'Queens Plz',
    '36th St',
    'Steinway St',
    '46th St',
    'Northern Blvd',
    '65th St',
    'Elmhurst Ave',
    'Grand Ave - Newtown',
    'Woodhaven Blvd - Queens Mall',
    '67th Ave',
    '63rd Dr - Rego Park',
    'Forest Hills - 71st Av',
    'Jackson Hts - Roosevelt Av',
    '23rd St - Ely Av'
  ],
  
  // J Line - Nassau Street Express (Queens to Manhattan to Brooklyn)
  'J': [
    'Jamaica Ctr - Parsons / Archer',
    'Sutphin Blvd - Archer Av',
    '121st St',
    'Woodhaven Blvd',
    '104th-102nd Sts',
    'Norwood Ave',
    'Cleveland St',
    'Crescent St',
    'Cypress Hills',
    '85th St - Forest Pky',
    '75th St - Eldert Ln',
    'Broadway Junction',
    'Alabama Ave',
    'Chauncey St',
    'Gates Ave',
    'Kosciuszko St',
    'Hewes St',
    'Marcy Ave',
    'Essex St',
    'Bowery',
    'Broad St'
  ],
  
  // Z Line - Nassau Street Express (Peak Direction Express) - Using exact station names
  'Z': [
    'Jamaica Ctr - Parsons / Archer',
    'Sutphin Blvd - Archer Av',
    '121st St',
    'Woodhaven Blvd',
    '104th-102nd Sts',
    'Norwood Ave',
    'Crescent St',
    '75th St - Eldert Ln',
    'Broadway Junction',
    'Chauncey St',
    'Gates Ave',
    'Marcy Ave',
    'Essex St',
    'Bowery',
    'Broad St'
  ],
  
  // W Line - Broadway Local (Astoria to Manhattan)
  'W': [
    'Astoria - Ditmars Blvd',
    'Astoria Blvd',
    '30th Ave',
    '36th Ave',
    '39th Ave',
    'Queensboro Plz',
    '5th Ave - 59th St',
    '49th St',
    'Herald Sq - 34th St',
    '28th St',
    '8th St - NYU',
    'Prince St',
    'City Hall',
    'Cortlandt St (NB only)',
    'Rector St',
    'Whitehall St'
  ],
  
  // Additional lines with basic ordering to prevent zigzag
  // B Line - 6th Avenue Express (Bronx to Brooklyn)
  'B': [
    'Bedford Park Blvd',
    '182nd-183rd Sts',
    'Fordham Rd',
    'Tremont Ave',
    '174th-175th Sts',
    '170th St',
    '167th St',
    '161st St - Yankee Stadium',
    '155th St',
    '145th St - St Nicholas Ave',
    '135th St - St Nicholas Ave',
    '125th St - St Nicholas Ave',
    'Cathedral Pkwy (110th St)',
    '103rd St - Central Park West',
    '96th St - Central Park West',
    '86th St - Central Park West',
    '81st St',
    '72nd St',
    '59th St - Columbus Circle',
    '47th-50th Sts - Rockefeller Ctr',
    '42nd St - Bryant Pk',
    'W 4th St - Washington Sq (Lower)',
    'Broadway - Lafayette St',
    'DeKalb Ave',
    'Prospect Park',
    'Parkside Ave',
    'Beverly Rd',
    'Cortelyou Rd',
    'Newkirk Ave',
    'Ave H',
    'Ave J',
    'Ave M',
    'Neck Rd',
    'Sheepshead Bay',
    'Brighton Beach'
  ],
  
  // Q Line - 2nd Avenue/Broadway Express (Manhattan to Brooklyn)
  'Q': [
    '96th St - 2nd Ave',
    '86th St - 2nd Ave',
    '72nd St - 2nd Ave',
    '57th St - 7th Ave',
    'Times Sq - 42nd St',
    'Herald Sq - 34th St',
    'Union Sq - 14th St',
    'Canal St',
    'DeKalb Ave',
    'Atlantic Av - Pacific St',
    '7th Ave',
    'Prospect Park',
    'Parkside Ave',
    'Beverly Rd',
    'Cortelyou Rd',
    'Newkirk Ave',
    'Ave H',
    'Ave J',
    'Ave M',
    'Neck Rd',
    'Sheepshead Bay',
    'Brighton Beach',
    'Ocean Pkwy',
    'W 8th St - NY Aquarium',
    'Coney Island - Stillwell Av'
  ],
  
  // R Line - Broadway Local (Queens to Brooklyn)
  'R': [
    'Forest Hills - 71st Av',
    '67th Ave',
    '63rd Dr - Rego Park',
    'Woodhaven Blvd - Queens Mall',
    'Grand Ave - Newtown',
    'Elmhurst Ave',
    'Jackson Hts - Roosevelt Av',
    'Northern Blvd',
    '65th St',
    'Steinway St',
    '46th St',
    '36th St',
    'Queens Plz',
    'Roosevelt Island - Main St',
    '5th Ave - 59th St',
    '49th St',
    'Herald Sq - 34th St',
    '28th St',
    '8th St - NYU',
    'Prince St',
    'City Hall',
    'Cortlandt St (NB only)',
    'Rector St',
    'Whitehall St',
    'Court St',
    'Lawrence St',
    'DeKalb Ave',
    'Atlantic Av - Pacific St',
    'Union St',
    '9th St',
    '25th St',
    '45th St',
    '53rd St',
    '59th St',
    '8th Ave',
    'Bay Ridge Ave',
    'Bay Ridge - 95th St'
  ],

  // F Line - 6th Avenue Local (Brooklyn to Queens)
  'F': [
    'Jamaica - 179th St',
    'Parsons Blvd',
    'Briarwood - Van Wyck Blvd',
    '75th Ave',
    'Kew Gardens - Union Tpke',
    'Jackson Hts - Roosevelt Av',
    'Elmhurst Ave',
    'Grand Ave - Newtown',
    'Woodside - 61st St',
    '39th Ave',
    '36th St',
    'Northern Blvd',
    'Queens Plz',
    '21st St - Queensbridge',
    'Roosevelt Island - Main St',
    'Lexington Ave - 63rd St',
    '57th St',
    '47th-50th Sts - Rockefeller Ctr',
    '42nd St - Bryant Pk',
    '34th St - Herald Sq',
    '23rd St',
    '14th St',
    'W 4th St - Washington Sq',
    'Broadway - Lafayette St',
    '2nd Ave',
    'Delancey St - Essex St',
    'E Broadway',
    'York St',
    'High St - Brooklyn Bridge',
    'Jay St - MetroTech',
    'Bergen St',
    'Carroll St',
    'Smith - 9th Sts',
    '4th Ave - 9th St',
    '7th Ave',
    '15th St - Prospect Park',
    'Fort Hamilton Pkwy',
    '62nd St',
    'New Utrecht Ave',
    '86th St',
    'Ave X',
    'Ave N',
    'Ave I',
    'Bay Pkwy',
    'Kings Hwy',
    'Ave U',
    'Ditmas Ave',
    '18th Ave',
    'Ave P',
    'W 8th St - NY Aquarium',
    'Coney Island - Stillwell Av'
  ]
};

// Helper function to get station order for a line
export function getStationOrder(lineId: string): string[] | undefined {
  return LINE_STATION_ORDER[lineId];
}

// Helper function to order stations according to route
export function orderStationsByRoute(stations: any[], lineId: string): any[] {
  const routeOrder = LINE_STATION_ORDER[lineId];
  
  if (!routeOrder) {
    // If no route order defined, sort by latitude (north to south)
    return stations.sort((a, b) => b.coordinates[1] - a.coordinates[1]);
  }
  
  console.log(`Ordering ${stations.length} stations for line ${lineId}`);
  console.log('Available stations:', stations.map(s => s.name));
  console.log('Route order:', routeOrder);
  
  // Create a map for quick lookup
  const stationMap = new Map(stations.map(s => [s.name, s]));
  
  // Order stations according to route
  const orderedStations: any[] = [];
  
  for (const stationName of routeOrder) {
    // Try exact match first
    let station = stationMap.get(stationName);
    
    // If not found, try more flexible matching
    if (!station) {
      for (const [name, s] of Array.from(stationMap.entries())) {
        // Try different matching strategies
        if (
          name === stationName ||
          name.toLowerCase() === stationName.toLowerCase() ||
          name.includes(stationName) || 
          stationName.includes(name) ||
          // Try without common suffixes/prefixes
          name.replace(/\s*-\s*.*/, '') === stationName.replace(/\s*-\s*.*/, '') ||
          // Try matching just the main part (before first dash)
          name.split(' - ')[0] === stationName.split(' - ')[0]
        ) {
          station = s;
          console.log(`Matched "${stationName}" to "${name}"`);
          break;
        }
      }
    } else {
      console.log(`Exact match: "${stationName}"`);
    }
    
    if (station && !orderedStations.includes(station)) {
      orderedStations.push(station);
    } else if (!station) {
      console.warn(`No match found for station: "${stationName}"`);
    }
  }
  
  // Don't add unmatched stations - they create disconnected line segments
  // Only use stations that are in the predefined route order
  console.log(`Excluded ${stations.length - orderedStations.length} stations not in route order`);
  
  // Log excluded stations for debugging
  for (const station of stations) {
    if (!orderedStations.includes(station)) {
      console.log(`Excluded station not in route: ${station.name}`);
    }
  }
  
  console.log(`Final order: ${orderedStations.length} stations`, orderedStations.map(s => s.name));
  return orderedStations;
}