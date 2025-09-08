const fs = require('fs');
const path = require('path');

console.log('🗽 Fixing incorrect borough assignments based on official MTA data...\n');

// Load data
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Build official borough lookup by GTFS ID
const officialBoroughs = new Map();
officialStations.forEach(station => {
  if (station.gtfs_stop_id && station.borough) {
    // Convert MTA borough codes to full names
    const boroughMap = {
      'M': 'Manhattan',
      'Bk': 'Brooklyn', 
      'Q': 'Queens',
      'Bx': 'Bronx',
      'SI': 'Staten Island'
    };
    
    const fullBorough = boroughMap[station.borough] || station.borough;
    officialBoroughs.set(station.gtfs_stop_id, {
      name: station.stop_name,
      borough: fullBorough,
      lines: station.daytime_routes
    });
  }
});

// Known incorrect borough assignments from the screenshot
const boroughCorrections = {
  // 104 St stations
  'J14': { correctBorough: 'Queens', incorrectShowing: 'Brooklyn' }, // J/Z line
  'A63': { correctBorough: 'Queens', incorrectShowing: 'Brooklyn' }, // A line (Liberty Ave)
  
  // 111 St stations  
  'J13': { correctBorough: 'Queens', incorrectShowing: 'Brooklyn' }, // J line
  'A64': { correctBorough: 'Queens', incorrectShowing: 'Brooklyn' }, // A line (Greenwood)
  '709': { correctBorough: 'Queens', incorrectShowing: 'Brooklyn' }, // 7 line
  
  // 116 St stations
  '707': { correctBorough: 'Queens', incorrectShowing: 'Manhattan' }, // 7 line (111 St actually)
  
  // 121 St station
  'J12': { correctBorough: 'Queens', incorrectShowing: 'Manhattan' }, // J/Z line
  
  // 125 St stations
  '246': { correctBorough: 'Manhattan', incorrectShowing: 'Queens' }, // 2/3 line (Lenox)
  '704': { correctBorough: 'Queens', incorrectShowing: 'Manhattan' }, // 7 line (Willets Point)
  
  // 135 St stations
  '247': { correctBorough: 'Manhattan', incorrectShowing: 'Queens' }, // 2/3 line
  '135': { correctBorough: 'Manhattan', incorrectShowing: 'Queens' }, // 1 line
  '626': { correctBorough: 'Manhattan', incorrectShowing: 'Queens' }, // B/C line
};

let corrected = 0;
let notFound = 0;

// Apply corrections
stations.forEach(station => {
  // Check if we have official data for this station
  const official = officialBoroughs.get(station.id);
  
  if (official && official.borough !== station.borough) {
    const oldBorough = station.borough;
    station.borough = official.borough;
    
    console.log(`✅ Fixed ${station.name} (${station.id})`);
    console.log(`   Old borough: ${oldBorough}`);
    console.log(`   New borough: ${official.borough}`);
    console.log(`   Lines: ${official.lines || station.lines.join(' ')}`);
    console.log('');
    
    corrected++;
  }
});

// Also check for stations with generic names that might be in wrong borough
const genericNamePatterns = [
  { pattern: /^1\d{2} St$/, shouldCheck: true },
  { pattern: /^1\d{2} Ave$/, shouldCheck: true },
];

genericNamePatterns.forEach(({ pattern }) => {
  const matchingStations = stations.filter(station => pattern.test(station.name));
  
  matchingStations.forEach(station => {
    const official = officialBoroughs.get(station.id);
    
    if (official && official.borough !== station.borough) {
      const oldBorough = station.borough;
      station.borough = official.borough;
      
      console.log(`✅ Fixed ${station.name} (${station.id})`);
      console.log(`   Old borough: ${oldBorough}`);
      console.log(`   New borough: ${official.borough}`);
      console.log('');
      
      corrected++;
    }
  });
});

// Save updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

// Generate summary by borough
const boroughCounts = {};
stations.forEach(station => {
  if (!boroughCounts[station.borough]) {
    boroughCounts[station.borough] = 0;
  }
  boroughCounts[station.borough]++;
});

console.log('\n📊 Summary:');
console.log(`   Corrected: ${corrected} stations`);
console.log(`   Total stations: ${stations.length}`);

console.log('\n🗽 Station distribution by borough:');
Object.entries(boroughCounts)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([borough, count]) => {
    console.log(`   ${borough}: ${count} stations`);
  });

console.log('\n✅ Borough assignments corrected!');