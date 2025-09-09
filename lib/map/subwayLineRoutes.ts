// Subway line routes with station order and terminal information
// This defines the actual path each line takes through the system

export interface LineRoute {
  id: string;
  name: string;
  color: string;
  terminals: {
    north: string;
    south: string;
  };
  stations: string[]; // Station slugs in order from south to north (or west to east for crosstown lines)
}

export const SUBWAY_LINE_ROUTES: Record<string, LineRoute> = {
  'TEST': {
    id: 'TEST',
    name: 'TEST - Test Line',
    color: '#FF0000',
    terminals: {
      north: 'test-north',
      south: 'test-south'
    },
    stations: [
      '103rd-st',
      '116th-st-columbia-university',
      '137th-st-city-college',
      '145th-st'
    ]
  },
  '1': {
    id: '1',
    name: '1 - Broadway-7th Avenue Local',
    color: '#EE352E',
    terminals: {
      north: 'van-cortlandt-park-242nd-st',
      south: 'south-ferry'
    },
    stations: [
      'south-ferry',
      'cortlandt-st-temporarily-closed',
      'chambers-st',
      'franklin-st',
      'canal-st',
      'houston-st',
      'christopher-st-sheridan-sq',
      '14th-st',
      '18th-st',
      '23rd-st',
      '28th-st',
      '34th-st-penn-station',
      'times-square-42nd-st',
      '50th-st',
      '59th-st-columbus-circle',
      '66th-st-lincoln-ctr',
      '72nd-st',
      '79th-st',
      '86th-st',
      '96th-st',
      '103rd-st',
      '110th-st-cathedral-pkwy',
      '116th-st-columbia-university',
      '125th-st',
      '137th-st-city-college',
      '145th-st',
      '157th-st',
      '168th-st',
      '181st-st',
      '191st-st',
      'dyckman-st',
      '207th-st',
      '215th-st',
      'marble-hill-225th-st',
      '231st-st',
      '238th-st',
      'van-cortlandt-park-242nd-st'
    ]
  },
  '4': {
    id: '4',
    name: '4 - Lexington Avenue Express',
    color: '#00933C',
    terminals: {
      north: 'woodlawn',
      south: 'bowling-green'
    },
    stations: [
      'bowling-green',
      'wall-st',
      'fulton-st',
      'brooklyn-bridge-city-hall',
      'canal-st',
      'union-square-14-st',
      'grand-central-42-st',
      '59-st',
      '86-st',
      '125-st',
      '138-st-grand-concourse',
      '149-st-grand-concourse',
      '161-st-yankee-stadium',
      '167-st',
      '170-st',
      'mt-eden-av',
      '176-st',
      'burnside-av',
      '183-st',
      'fordham-rd',
      'kingsbridge-rd',
      'bedford-park-blvd',
      'mosholu-pkwy',
      'woodlawn'
    ]
  },
  '7': {
    id: '7',
    name: '7 - Flushing Local/Express',
    color: '#B933AD',
    terminals: {
      west: 'times-square-42-st',
      east: 'flushing-main-st'
    },
    stations: [
      'times-square-42-st',
      '5-av',
      'grand-central-42-st',
      'vernon-blvd-jackson-av',
      'hunters-point-av',
      'court-sq',
      'queensboro-plaza',
      '33-st-rawson-st',
      '40-st-lowery-st',
      '46-st-bliss-st',
      '52-st-lincoln-av',
      '61-st-woodside',
      '69-st',
      '74-st-broadway',
      '82-st-jackson-hts',
      '90-st-elmhurst-av',
      'junction-blvd',
      '103-st-corona-plaza',
      '111-st',
      'mets-willets-point',
      'flushing-main-st'
    ]
  },
  'L': {
    id: 'L',
    name: 'L - 14th Street-Canarsie Local',
    color: '#A7A9AC',
    terminals: {
      west: '14th-st-8th-ave',
      east: 'canarsie-rockaway-pkwy'
    },
    stations: [
      '14th-st-8th-ave',
      '6th-ave',
      '14th-st-union-sq',
      '3rd-ave',
      '1st-ave',
      'bedford-ave',
      'lorimer-st',
      'graham-ave',
      'grand-st',
      'montrose-ave'
    ]
  },
  'N': {
    id: 'N',
    name: 'N - Broadway Express',
    color: '#FCCC0A',
    terminals: {
      north: 'astoria-ditmars-blvd',
      south: 'coney-island-stillwell-av'
    },
    stations: [
      'coney-island-stillwell-av',
      '86-st',
      'av-u',
      'kings-hwy',
      'bay-pkwy',
      '20-av',
      '18-av',
      '8-av',
      'fort-hamilton-pkwy',
      'new-utrecht-av',
      '62-st',
      '36-st',
      'atlantic-av-barclays',
      'union-st',
      'court-st',
      'whitehall-st-south-ferry',
      'rector-st',
      'canal-st',
      '14-st-union-sq',
      '23-st',
      '28-st',
      'herald-square',
      'times-square-42-st',
      '49-st',
      '57-st-7-av',
      '5-av-59-st',
      'lexington-av-59-st',
      'queensboro-plaza',
      '39-av',
      '36-av',
      'broadway',
      '30-av',
      'astoria-blvd',
      'astoria-ditmars-blvd'
    ]
  },
  'Q': {
    id: 'Q',
    name: 'Q - Broadway Express',
    color: '#FCCC0A',
    terminals: {
      north: '96-st',
      south: 'coney-island-stillwell-av'
    },
    stations: [
      'coney-island-stillwell-av',
      'ocean-pkwy',
      'west-8-st-ny-aquarium',
      'brighton-beach',
      'sheepshead-bay',
      'neck-rd',
      'av-u',
      'kings-hwy',
      'av-j',
      'av-h',
      'newkirk-plaza',
      'cortelyou-rd',
      'beverley-rd',
      'church-av',
      'parkside-av',
      'prospect-park',
      '7-av',
      'atlantic-av-barclays',
      'dekalb-av',
      'canal-st',
      '14-st-union-sq',
      '23-st',
      '28-st',
      'herald-square',
      'times-square-42-st',
      '49-st',
      '57-st-7-av',
      'lexington-av-59-st',
      '72-st',
      '86-st',
      '96-st'
    ]
  },
  'A': {
    id: 'A',
    name: 'A - 8th Avenue Express',
    color: '#0039A6',
    terminals: {
      north: '207-st',
      south: 'far-rockaway-mott-av'
    },
    stations: [
      'far-rockaway-mott-av',
      'beach-25-st',
      'beach-36-st',
      'beach-44-st',
      'beach-60-st',
      'beach-67-st',
      'beach-90-st',
      'beach-98-st',
      'rockaway-park-beach-116-st',
      'beach-105-st',
      'howard-beach-jfk',
      'aqueduct-racetrack',
      'aqueduct-north-conduit-av',
      'grant-av',
      '80-st',
      '88-st',
      'rockaway-blvd',
      '104-st',
      '111-st',
      'ozone-park-lefferts-blvd',
      'nostrand-av',
      'utica-av',
      'ralph-av',
      'rockaway-av',
      'broadway-junction',
      'liberty-av',
      'van-siclen-av',
      'shepherd-av',
      'euclid-av',
      'hoyt-schermerhorn',
      'jay-st-metrotech',
      'high-st',
      'fulton-st',
      'chambers-st',
      'canal-st',
      'spring-st',
      'west-4-st',
      '14-st',
      '23-st',
      '34-st-penn-station',
      '42-st-port-authority',
      '59-st-columbus-circle',
      '125-st',
      '145-st',
      '155-st',
      '163-st-amsterdam-av',
      '168-st',
      '175-st',
      '181-st',
      '190-st',
      'dyckman-st',
      '207-st'
    ]
  },
  'E': {
    id: 'E',
    name: 'E - 8th Avenue Local',
    color: '#0039A6',
    terminals: {
      north: 'jamaica-center-parsons-archer',
      south: 'world-trade-center'
    },
    stations: [
      'world-trade-center',
      'chambers-st',
      'canal-st',
      'spring-st',
      'west-4-st',
      '14-st',
      '23-st',
      '34-st-penn-station',
      '42-st-port-authority',
      '50-st',
      '7-av',
      '5-av-53-st',
      'lexington-av-53-st',
      'court-sq-23-st',
      'queens-plaza',
      '36-st',
      'steinway-st',
      '46-st',
      'northern-blvd',
      '65-st',
      'roosevelt-av',
      'elmhurst-av',
      'grand-av-newtown',
      'woodhaven-blvd',
      '63-dr-rego-park',
      '67-av',
      'forest-hills-71-av',
      '75-av',
      'kew-gardens-union-tpke',
      'briarwood',
      'sutphin-blvd',
      'parsons-blvd',
      '169-st',
      'jamaica-179-st',
      'jamaica-center-parsons-archer'
    ]
  }
};

// Helper function to get line route by ID
export function getLineRoute(lineId: string): LineRoute | undefined {
  return SUBWAY_LINE_ROUTES[lineId];
}

// Helper function to get all line IDs
export function getAllLineIds(): string[] {
  return Object.keys(SUBWAY_LINE_ROUTES);
}

// Helper function to check if a station is on a line
export function isStationOnLine(stationSlug: string, lineId: string): boolean {
  const route = SUBWAY_LINE_ROUTES[lineId];
  return route ? route.stations.includes(stationSlug) : false;
}