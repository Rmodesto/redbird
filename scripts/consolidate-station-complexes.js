const fs = require('fs');
const path = require('path');

console.log('🚇 Consolidating duplicate stations into unified complexes...\n');

// Load data
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Build official complex data
const officialComplexes = new Map();
officialStations.forEach(station => {
  // Use complex_id if available, otherwise use station name + borough as key
  const complexKey = station.complex_id || `${station.stop_name}_${station.borough}`;
  
  if (!officialComplexes.has(complexKey)) {
    officialComplexes.set(complexKey, {
      name: station.stop_name,
      borough: station.borough === 'M' ? 'Manhattan' :
               station.borough === 'Bk' ? 'Brooklyn' :
               station.borough === 'Q' ? 'Queens' :
               station.borough === 'Bx' ? 'Bronx' : 'Staten Island',
      lines: new Set(),
      gtfsIds: [],
      coordinates: []
    });
  }
  
  const complex = officialComplexes.get(complexKey);
  
  // Add lines
  if (station.daytime_routes) {
    station.daytime_routes.trim().split(/\s+/).forEach(line => {
      if (line && /^[1-7ABCDEFGJLMNQRSWZ]$/.test(line)) {
        complex.lines.add(line);
      }
    });
  }
  
  // Add GTFS ID
  complex.gtfsIds.push(station.gtfs_stop_id);
  
  // Add coordinates
  complex.coordinates.push({
    lat: parseFloat(station.gtfs_latitude),
    lng: parseFloat(station.gtfs_longitude)
  });
});

// Group current stations by name and borough for consolidation
const stationGroups = new Map();
stations.forEach(station => {
  const key = `${station.name}_${station.borough}`;
  if (!stationGroups.has(key)) {
    stationGroups.set(key, []);
  }
  stationGroups.get(key).push(station);
});

// Find groups that need consolidation (more than 1 station with same name/borough)
const toConsolidate = [];
for (const [key, group] of stationGroups.entries()) {
  if (group.length > 1) {
    toConsolidate.push({
      key,
      stations: group
    });
  }
}

console.log(`Found ${toConsolidate.length} station groups to consolidate:\n`);

// Consolidate stations
const consolidatedStations = [];
const removedStationIds = new Set();

toConsolidate.forEach(({ key, stations: stationGroup }) => {
  const [name, borough] = key.split('_');
  
  // Merge all lines from the group
  const allLines = new Set();
  const allPlatforms = [];
  const allAmenities = new Set();
  let primaryStation = stationGroup[0];
  
  stationGroup.forEach(station => {
    // Collect all lines
    station.lines.forEach(line => allLines.add(line));
    
    // Collect all platforms
    allPlatforms.push(...station.platforms);
    
    // Collect all amenities
    station.amenities?.forEach(amenity => allAmenities.add(amenity));
    
    // Mark secondary stations for removal
    if (station !== primaryStation) {
      removedStationIds.add(station.id);
    }
  });
  
  // Update primary station with consolidated data
  primaryStation.lines = Array.from(allLines).sort();
  primaryStation.platforms = allPlatforms;
  primaryStation.amenities = Array.from(allAmenities);
  
  console.log(`✅ Consolidated ${name} (${borough})`);
  console.log(`   Combined ${stationGroup.length} stations`);
  console.log(`   Station IDs: ${stationGroup.map(s => s.id).join(', ')}`);
  console.log(`   All lines: [${primaryStation.lines.join(', ')}]`);
  console.log('');
  
  consolidatedStations.push(primaryStation);
});

// Add non-duplicate stations
stations.forEach(station => {
  if (!removedStationIds.has(station.id)) {
    const key = `${station.name}_${station.borough}`;
    const group = stationGroups.get(key);
    if (!group || group.length === 1) {
      consolidatedStations.push(station);
    }
  }
});

// Sort by name for consistency
consolidatedStations.sort((a, b) => a.name.localeCompare(b.name));

// Save consolidated data
fs.writeFileSync(stationsPath, JSON.stringify(consolidatedStations, null, 2));

// Save a backup of the original
const backupPath = path.join(dataDir, 'stations-before-consolidation.json');
fs.writeFileSync(backupPath, JSON.stringify(stations, null, 2));

console.log('\n📊 Summary:');
console.log(`   Original stations: ${stations.length}`);
console.log(`   Consolidated stations: ${consolidatedStations.length}`);
console.log(`   Stations removed: ${stations.length - consolidatedStations.length}`);
console.log(`   Backup saved to: stations-before-consolidation.json`);

// Show some examples of major consolidations
const majorConsolidations = toConsolidate
  .filter(g => g.stations.length >= 3)
  .sort((a, b) => b.stations.length - a.stations.length)
  .slice(0, 5);

if (majorConsolidations.length > 0) {
  console.log('\n🏢 Major station complexes consolidated:');
  majorConsolidations.forEach(({ key, stations: group }) => {
    const [name] = key.split('_');
    const allLines = new Set();
    group.forEach(s => s.lines.forEach(l => allLines.add(l)));
    console.log(`   ${name}: ${group.length} stations → [${Array.from(allLines).sort().join(', ')}]`);
  });
}

console.log('\n✅ Station consolidation complete!');