const fs = require('fs');
const path = require('path');

console.log('🚇 Updating station data with official MTA line information...\n');

// Load data
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Build lookup maps
const officialByName = new Map();
const officialByCoords = new Map();
const officialByGtfsId = new Map();

officialStations.forEach(station => {
  // Normalize name for matching
  const normalizedName = station.stop_name.toLowerCase()
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/st\.?$/i, 'st')
    .replace(/ave?\.?$/i, 'av')
    .replace(/street/i, 'st')
    .replace(/avenue/i, 'av')
    .replace(/\b(the)\b/gi, '')
    .trim();
  
  officialByName.set(normalizedName, station);
  
  // Create coordinate key for proximity matching
  const lat = parseFloat(station.gtfs_latitude);
  const lon = parseFloat(station.gtfs_longitude);
  const coordKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  officialByCoords.set(coordKey, station);
  
  // GTFS ID mapping
  if (station.gtfs_stop_id) {
    officialByGtfsId.set(station.gtfs_stop_id, station);
  }
});

function findBestMatch(station) {
  // Try GTFS ID first if available
  if (station.id && officialByGtfsId.has(station.id)) {
    return officialByGtfsId.get(station.id);
  }
  
  // Try exact name match
  const normalizedName = station.name.toLowerCase()
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/st\.?$/i, 'st')
    .replace(/ave?\.?$/i, 'av')
    .replace(/street/i, 'st')
    .replace(/avenue/i, 'av')
    .replace(/\b(the)\b/gi, '')
    .trim();
  
  if (officialByName.has(normalizedName)) {
    return officialByName.get(normalizedName);
  }
  
  // Try coordinate proximity match
  const coordKey = `${station.latitude.toFixed(3)},${station.longitude.toFixed(3)}`;
  if (officialByCoords.has(coordKey)) {
    return officialByCoords.get(coordKey);
  }
  
  // Try fuzzy coordinate match (within ~100 meters)
  const bestMatch = { distance: Infinity, station: null };
  
  for (const [key, official] of officialByCoords.entries()) {
    const [officialLat, officialLon] = key.split(',').map(Number);
    const latDiff = Math.abs(station.latitude - officialLat);
    const lonDiff = Math.abs(station.longitude - officialLon);
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    
    if (distance < bestMatch.distance && distance < 0.002) { // ~200 meters
      bestMatch.distance = distance;
      bestMatch.station = official;
    }
  }
  
  if (bestMatch.station) {
    return bestMatch.station;
  }
  
  // Try partial name matching with same borough
  for (const [name, official] of officialByName.entries()) {
    const stationBoroughCode = getBoroughCode(station.borough);
    if (official.borough === stationBoroughCode) {
      // Check if names have significant overlap
      const words1 = normalizedName.split(' ').filter(w => w.length > 2);
      const words2 = name.split(' ').filter(w => w.length > 2);
      const commonWords = words1.filter(w => words2.includes(w));
      
      if (commonWords.length >= Math.min(words1.length, words2.length) / 2) {
        return official;
      }
    }
  }
  
  return null;
}

function getBoroughCode(boroughName) {
  const codes = {
    'Manhattan': 'M',
    'Brooklyn': 'Bk',
    'Queens': 'Q', 
    'Bronx': 'Bx',
    'Staten Island': 'SI'
  };
  return codes[boroughName] || boroughName.substring(0, 2).toUpperCase();
}

let updated = 0;
let notFound = 0;
let unchanged = 0;

// Update stations with official line data
const updatedStations = stations.map(station => {
  const official = findBestMatch(station);
  
  if (official && official.daytime_routes) {
    // Parse the daytime_routes field (space-separated train lines)
    const newLines = official.daytime_routes.trim()
      .split(/\s+/)
      .filter(line => line && /^[1-7ABCDEFGJLMNQRSWZ]$/.test(line))
      .sort();
    
    const oldLines = [...(station.lines || [])].sort();
    
    if (newLines.length > 0) {
      // Update station lines
      station.lines = newLines;
      
      // Update platform lines too
      if (station.platforms) {
        station.platforms.forEach(platform => {
          platform.lines = newLines;
        });
      }
      
      // Check if actually changed
      if (JSON.stringify(oldLines) !== JSON.stringify(newLines)) {
        console.log(`✅ ${station.name} (${station.id})`);
        console.log(`   Old: [${oldLines.join(', ') || 'empty'}]`);
        console.log(`   New: [${newLines.join(', ')}]`);
        console.log(`   Matched with: ${official.stop_name}`);
        console.log(`   Official routes: "${official.daytime_routes}"`);
        console.log('');
        updated++;
      } else {
        unchanged++;
      }
    } else {
      unchanged++;
    }
  } else {
    if (!station.lines || station.lines.length === 0) {
      console.log(`⚠️  No official match found for: ${station.name} (${station.id})`);
      console.log(`   Location: ${station.borough} (${station.latitude}, ${station.longitude})`);
      notFound++;
    } else {
      unchanged++;
    }
  }
  
  return station;
});

// Save updated data
fs.writeFileSync(stationsPath, JSON.stringify(updatedStations, null, 2));

// Generate summary report
const summaryStats = {};
updatedStations.forEach(station => {
  if (station.lines && station.lines.length > 0) {
    station.lines.forEach(line => {
      if (!summaryStats[line]) summaryStats[line] = 0;
      summaryStats[line]++;
    });
  }
});

console.log('\n📊 Summary:');
console.log(`   Total stations: ${updatedStations.length}`);
console.log(`   Updated with official data: ${updated}`);
console.log(`   Unchanged: ${unchanged}`);
console.log(`   No match found: ${notFound}`);

console.log('\n📈 Lines distribution:');
Object.entries(summaryStats)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([line, count]) => {
    console.log(`   ${line}: ${count} stations`);
  });

console.log('\n✅ Station data updated with official MTA line information!');

// Save a mapping file for future reference
const mappingData = {
  updated: new Date().toISOString(),
  source: 'NY Open Data - MTA Subway Stations (39hk-dx4f)',
  summary: { updated, unchanged, notFound, total: updatedStations.length }
};
fs.writeFileSync(path.join(dataDir, 'mta-update-log.json'), JSON.stringify(mappingData, null, 2));