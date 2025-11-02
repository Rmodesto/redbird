const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing incorrect station line assignments based on official MTA data...\n');

// Load data
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Known incorrect assignments from the screenshot
const corrections = {
  // 103 St Manhattan (showing 1) should show B,C (8th Ave line)
  'A18': { expectedLines: ['B', 'C'], currentWrong: ['1'] },
  
  // 103 St Queens (showing 6) should show 7 (Corona Plaza)
  '706': { expectedLines: ['7'], currentWrong: ['6'] },
  
  // 103 St Manhattan (showing B,C) - this one is actually correct
  
  // 125 St Manhattan - multiple stations with different lines
  'A03': { expectedLines: ['A', 'B', 'C', 'D'], name: '125 St (8th Ave)' },
  'A05': { expectedLines: ['A', 'B', 'C', 'D'], name: '125 St (St Nicholas)' },
  '116': { expectedLines: ['1'], name: '125 St (Broadway-7th Ave)' },
  '465': { expectedLines: ['4', '5', '6'], name: '125 St (Lexington Ave)' },
  '246': { expectedLines: ['2', '3'], name: '125 St (Lenox Ave)' },
  
  // Other corrections based on visual inspection
  '121': { expectedLines: ['1'], name: '86 St (Broadway-7th Ave)' },
  '625': { expectedLines: ['4', '5', '6'], name: '96 St (Lexington Ave)' }
};

// Build official lookup by stop_name and coordinates for verification
const officialByGtfs = new Map();
officialStations.forEach(station => {
  if (station.gtfs_stop_id && station.daytime_routes) {
    const lines = station.daytime_routes.trim()
      .split(/\s+/)
      .filter(line => line && /^[1-7ABCDEFGJLMNQRSWZ]$/.test(line))
      .sort();
    
    officialByGtfs.set(station.gtfs_stop_id, {
      name: station.stop_name,
      lines,
      borough: station.borough
    });
  }
});

let corrected = 0;
let verified = 0;

// Apply corrections
Object.entries(corrections).forEach(([stationId, correction]) => {
  const station = stations.find(s => s.id === stationId);
  
  if (station) {
    // Check if we have official data to verify
    const official = officialByGtfs.get(stationId);
    
    let linesToUse = correction.expectedLines;
    
    // If we have official data, use that instead
    if (official && official.lines.length > 0) {
      linesToUse = official.lines;
      console.log(`✅ Using official data for ${station.name} (${stationId})`);
      verified++;
    } else {
      console.log(`⚡ Using correction for ${station.name} (${stationId})`);
    }
    
    const oldLines = [...station.lines];
    
    // Update station lines
    station.lines = linesToUse;
    
    // Update platform lines
    if (station.platforms) {
      station.platforms.forEach(platform => {
        platform.lines = linesToUse;
      });
    }
    
    console.log(`   Old: [${oldLines.join(', ')}]`);
    console.log(`   New: [${linesToUse.join(', ')}]`);
    console.log(`   ${official ? 'Official MTA data' : 'Manual correction'}`);
    console.log('');
    
    corrected++;
  } else {
    console.log(`⚠️  Station ${stationId} not found`);
  }
});

// Additional check: Find any station with obviously wrong single-line assignments
// that should be multi-line based on name patterns
const potentialIssues = stations.filter(station => {
  if (station.lines.length === 1) {
    // Major transfer stations that should have multiple lines
    const majorStations = [
      'times sq', 'union sq', '14 st-union sq', 'herald sq', '34 st-penn',
      '42 st-port authority', '59 st-columbus', 'atlantic av', 'jay st',
      'whitehall', 'bowling green', 'fulton st', 'chambers st'
    ];
    
    const stationNameLower = station.name.toLowerCase();
    return majorStations.some(major => stationNameLower.includes(major));
  }
  return false;
});

if (potentialIssues.length > 0) {
  console.log('\n🔍 Potential multi-line stations showing only one line:');
  potentialIssues.forEach(station => {
    console.log(`   ${station.name} (${station.id}): [${station.lines.join(', ')}]`);
  });
}

// Save updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   Corrected: ${corrected} stations`);
console.log(`   Verified with official data: ${verified} stations`);
console.log(`   Manual corrections: ${corrected - verified} stations`);
console.log(`   Total stations: ${stations.length}`);

console.log('\n✅ Station line corrections applied!');