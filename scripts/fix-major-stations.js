const fs = require('fs');
const path = require('path');

console.log('🚇 Fixing major multi-line station assignments...\n');

// Load data
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Group official data by station name to get all lines for complex stations
const stationComplexes = new Map();

officialStations.forEach(station => {
  const key = `${station.stop_name}_${station.borough}`;
  
  if (!stationComplexes.has(key)) {
    stationComplexes.set(key, {
      name: station.stop_name,
      borough: station.borough,
      lines: new Set(),
      gtfsIds: []
    });
  }
  
  const complex = stationComplexes.get(key);
  
  // Add all lines from this station
  if (station.daytime_routes) {
    const lines = station.daytime_routes.trim().split(/\s+/)
      .filter(line => line && /^[1-7ABCDEFGJLMNQRSWZ]$/.test(line));
    lines.forEach(line => complex.lines.add(line));
  }
  
  complex.gtfsIds.push(station.gtfs_stop_id);
});

// Convert Sets to sorted arrays
for (const [key, complex] of stationComplexes.entries()) {
  complex.lines = Array.from(complex.lines).sort();
}

// Major stations that should have multiple lines
const majorStationsToFix = [
  { pattern: /^Times Sq-42 St$/i, expectedMinLines: 3 },
  { pattern: /^14 St-Union Sq$/i, expectedMinLines: 3 },
  { pattern: /^59 St-Columbus Circle$/i, expectedMinLines: 2 },
  { pattern: /^Atlantic Av-Barclays/i, expectedMinLines: 2 },
  { pattern: /^Fulton St$/i, expectedMinLines: 2 },
  { pattern: /^Jay St-MetroTech$/i, expectedMinLines: 2 },
  { pattern: /^Herald Sq$/i, expectedMinLines: 2 },
  { pattern: /^34 St-Penn Station$/i, expectedMinLines: 2 }
];

let fixed = 0;

// Find and fix stations
majorStationsToFix.forEach(({ pattern, expectedMinLines }) => {
  const matchingStations = stations.filter(station => 
    pattern.test(station.name) && station.lines.length < expectedMinLines
  );
  
  matchingStations.forEach(station => {
    // Find the official complex for this station
    const complexKey = `${station.name}_${station.borough === 'Manhattan' ? 'M' : 
                                         station.borough === 'Brooklyn' ? 'Bk' :
                                         station.borough === 'Queens' ? 'Q' :
                                         station.borough === 'Bronx' ? 'Bx' : 'SI'}`;
    
    const complex = stationComplexes.get(complexKey);
    
    if (complex && complex.lines.length >= expectedMinLines) {
      const oldLines = [...station.lines];
      station.lines = complex.lines;
      
      // Update platforms
      if (station.platforms) {
        station.platforms.forEach(platform => {
          platform.lines = complex.lines;
        });
      }
      
      console.log(`✅ Fixed ${station.name} (${station.id})`);
      console.log(`   Old: [${oldLines.join(', ')}]`);
      console.log(`   New: [${complex.lines.join(', ')}]`);
      console.log(`   Official GTFS IDs: ${complex.gtfsIds.join(', ')}`);
      console.log('');
      
      fixed++;
    } else {
      // Try alternative approach - find by coordinates or similar name
      console.log(`⚠️  Could not find official complex for ${station.name} (${station.borough})`);
      
      // Manual fixes for known cases
      if (station.name === 'Times Sq-42 St') {
        const allTimesSquareLines = ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'];
        station.lines = allTimesSquareLines;
        station.platforms?.forEach(platform => platform.lines = allTimesSquareLines);
        console.log(`✅ Manual fix for Times Square: [${allTimesSquareLines.join(', ')}]`);
        fixed++;
      } else if (station.name === '14 St-Union Sq' && station.borough === 'Manhattan') {
        const unionSqLines = ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'];
        station.lines = unionSqLines;
        station.platforms?.forEach(platform => platform.lines = unionSqLines);
        console.log(`✅ Manual fix for Union Square: [${unionSqLines.join(', ')}]`);
        fixed++;
      } else if (station.name === '59 St-Columbus Circle') {
        const columbusLines = ['1', 'A', 'B', 'C', 'D'];
        station.lines = columbusLines;
        station.platforms?.forEach(platform => platform.lines = columbusLines);
        console.log(`✅ Manual fix for Columbus Circle: [${columbusLines.join(', ')}]`);
        fixed++;
      }
    }
  });
});

// Save updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

console.log(`📊 Summary:`);
console.log(`   Fixed major stations: ${fixed}`);
console.log(`   Total stations: ${stations.length}`);
console.log('\n✅ Major station fixes applied!');