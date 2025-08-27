const fs = require('fs');
const path = require('path');

// Load station data
const stationsPath = path.join(__dirname, '../data/stations.json');
const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));

console.log('🚇 Fixing station service patterns based on actual NYC subway operations...\n');

// Define correct service patterns for stations
// Based on actual NYC subway service (weekday daytime service)
const stationServiceCorrections = {
  // 8th Avenue Line (A/C/E and B/D)
  'A18': { 
    name: '103 St', 
    lines: ['B', 'C'], // Local station - no A express
    note: 'Local station on Central Park West'
  },
  'A16': {
    name: '116 St',
    lines: ['B', 'C'], // Local station - no A express
    note: 'Local station on Central Park West'
  },
  'A17': {
    name: 'Cathedral Pkwy (110 St)',
    lines: ['B', 'C'], // Local station
    note: 'Local station'
  },
  'A19': {
    name: '96 St',
    lines: ['B', 'C'], // Local station
    note: 'Local station on Central Park West'
  },
  'A20': {
    name: '86 St',
    lines: ['B', 'C'], // Local station
    note: 'Local station'
  },
  'A21': {
    name: '81 St-Museum of Natural History',
    lines: ['B', 'C'], // Local station
    note: 'Local station'
  },
  'A22': {
    name: '72 St',
    lines: ['B', 'C'], // Local station
    note: 'Local station'
  },
  'A24': {
    name: '59 St-Columbus Circle',
    lines: ['A', 'B', 'C', 'D'], // Major express stop
    note: 'Express/Local transfer station'
  },
  'A25': {
    name: '50 St',
    lines: ['C', 'E'], // Local station
    note: 'Local station - no A express'
  },
  'A27': {
    name: '42 St-Port Authority',
    lines: ['A', 'C', 'E'], // Express stop
    note: 'Express station'
  },
  'A28': {
    name: '34 St-Penn Station',
    lines: ['A', 'C', 'E'], // Express stop
    note: 'Express station'
  },
  'A30': {
    name: '23 St',
    lines: ['C', 'E'], // Local station
    note: 'Local station'
  },
  'A31': {
    name: '14 St',
    lines: ['A', 'C', 'E', 'L'], // Express stop
    note: 'Express station with L transfer'
  },
  'A32': {
    name: 'W 4 St-Washington Sq',
    lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'], // Major junction
    note: 'Major transfer hub'
  },
  'A33': {
    name: 'Spring St',
    lines: ['C', 'E'], // Local station
    note: 'Local station'
  },
  'A34': {
    name: 'Canal St',
    lines: ['A', 'C', 'E'], // Express stop
    note: 'Express station'
  },
  
  // Lexington Avenue Line corrections (4/5/6)
  '625': {
    name: '96 St',
    lines: ['4', '5', '6'], // All services stop here
    note: 'Express and local stop'
  },
  '626': {
    name: '86 St',
    lines: ['4', '5', '6'], // Express stop
    note: 'Express and local stop'
  },
  '627': {
    name: '77 St',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '628': {
    name: '68 St-Hunter College',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '629': {
    name: '59 St',
    lines: ['4', '5', '6'], // Express stop
    note: 'Express and local stop'
  },
  '630': {
    name: '51 St',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '631': {
    name: 'Grand Central-42 St',
    lines: ['4', '5', '6', '7'], // Major hub
    note: 'Major express station and transfer hub'
  },
  '632': {
    name: '33 St',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '633': {
    name: '28 St',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '634': {
    name: '23 St',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '635': {
    name: '14 St-Union Sq',
    lines: ['4', '5', '6'], // Express stop
    note: 'Express and local stop'
  },
  '636': {
    name: 'Astor Pl',
    lines: ['6'], // Local only
    note: 'Local station only'
  },
  '640': {
    name: 'Brooklyn Bridge-City Hall',
    lines: ['4', '5', '6'], // Terminal for 6
    note: 'Terminal station for 6, through station for 4/5'
  },
  
  // 7th Avenue Line corrections (1/2/3)
  '116': {
    name: '125 St',
    lines: ['1', '2', '3'], // All services
    note: 'Express and local stop'
  },
  '117': {
    name: '116 St-Columbia University',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '118': {
    name: 'Cathedral Pkwy (110 St)',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '119': {
    name: '103 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '120': {
    name: '96 St',
    lines: ['1', '2', '3'], // Express stop
    note: 'Express and local stop'
  },
  '121': {
    name: '86 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '122': {
    name: '79 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '123': {
    name: '72 St',
    lines: ['1', '2', '3'], // Express stop
    note: 'Express and local stop'
  },
  '124': {
    name: '66 St-Lincoln Center',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '125': {
    name: '59 St-Columbus Circle',
    lines: ['1', '2'], // No 3 train here
    note: 'Local and express stop'
  },
  '126': {
    name: '50 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '127': {
    name: 'Times Sq-42 St',
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'], // Major hub
    note: 'Major express station and transfer hub'
  },
  '128': {
    name: '34 St-Penn Station',
    lines: ['1', '2', '3'], // Express stop
    note: 'Express and local stop'
  },
  '129': {
    name: '28 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '130': {
    name: '23 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '131': {
    name: '18 St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '132': {
    name: '14 St',
    lines: ['1', '2', '3'], // Express stop
    note: 'Express and local stop'
  },
  '133': {
    name: 'Christopher St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '134': {
    name: 'Houston St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '135': {
    name: 'Canal St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '136': {
    name: 'Franklin St',
    lines: ['1'], // Local only
    note: 'Local station only'
  },
  '137': {
    name: 'Chambers St',
    lines: ['1', '2', '3'], // Express stop
    note: 'Express and local stop'
  }
};

let corrected = 0;
let notFound = 0;

// Apply corrections
Object.entries(stationServiceCorrections).forEach(([stationId, correction]) => {
  const station = stations.find(s => s.id === stationId);
  
  if (station) {
    const oldLines = [...station.lines];
    station.lines = correction.lines;
    
    // Update platform lines too
    station.platforms.forEach(platform => {
      platform.lines = correction.lines;
    });
    
    // Only log if there was an actual change
    if (JSON.stringify(oldLines.sort()) !== JSON.stringify(correction.lines.sort())) {
      console.log(`✅ ${station.name} (${stationId})`);
      console.log(`   Old: [${oldLines.join(', ')}]`);
      console.log(`   New: [${correction.lines.join(', ')}]`);
      console.log(`   ${correction.note}`);
      console.log('');
      corrected++;
    }
  } else {
    console.log(`⚠️  Station ${stationId} not found`);
    notFound++;
  }
});

// Write updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   Corrected: ${corrected} stations`);
console.log(`   Not found: ${notFound} stations`);
console.log(`   Total stations: ${stations.length}`);

console.log('\n✅ Station service patterns updated!');