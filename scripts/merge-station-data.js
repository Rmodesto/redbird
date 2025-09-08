const fs = require('fs');
const path = require('path');

// Load all data sources
const dataDir = path.join(__dirname, '../data');
const stationsPath = path.join(dataDir, 'stations.json');
const officialStationsPath = path.join(dataDir, 'nyc-subway-stations-official.json');
const outputPath = path.join(dataDir, 'stations-merged.json');

console.log('🚇 Merging station data from multiple sources...\n');

// Load current station data
const currentStations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const officialData = JSON.parse(fs.readFileSync(officialStationsPath, 'utf8'));

// Create lookup maps for matching
const officialByName = new Map();
const officialByCoords = new Map();

// Build lookup maps from official data
officialData.stations.forEach(station => {
  // Normalize name for matching
  const normalizedName = station.name.toLowerCase()
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/st\.?$/i, 'st')
    .replace(/ave?\.?$/i, 'av')
    .replace(/street/i, 'st')
    .replace(/avenue/i, 'av')
    .trim();
  
  officialByName.set(normalizedName, station);
  
  // Create coordinate key for proximity matching (rounded to 3 decimals)
  const coordKey = `${station.coordinates[1].toFixed(3)},${station.coordinates[0].toFixed(3)}`;
  officialByCoords.set(coordKey, station);
});

// Helper function to find matching official station
function findOfficialMatch(station) {
  // Try exact name match first
  const normalizedName = station.name.toLowerCase()
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/st\.?$/i, 'st')
    .replace(/ave?\.?$/i, 'av')
    .replace(/street/i, 'st')
    .replace(/avenue/i, 'av')
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
  for (const [key, official] of officialByCoords.entries()) {
    const [officialLat, officialLon] = key.split(',').map(Number);
    const latDiff = Math.abs(station.latitude - officialLat);
    const lonDiff = Math.abs(station.longitude - officialLon);
    
    if (latDiff < 0.001 && lonDiff < 0.001) {
      return official;
    }
  }
  
  // Try partial name match
  for (const [name, official] of officialByName.entries()) {
    if (name.includes(normalizedName) || normalizedName.includes(name)) {
      // Verify it's in the same borough to avoid false matches
      if (station.borough && official.borough && 
          station.borough.toLowerCase() === official.borough.toLowerCase()) {
        return official;
      }
    }
  }
  
  return null;
}

// Special case mappings for known mismatches
const specialMappings = {
  'L06': '1st-ave', // 1 Av station
  '103': '103rd-st', // 103 St station
  // Add more as needed
};

let updated = 0;
let notFound = 0;
let unchanged = 0;

// Merge data
const mergedStations = currentStations.map(station => {
  const official = findOfficialMatch(station) || 
                   (specialMappings[station.id] ? 
                    officialData.stations.find(s => s.id === specialMappings[station.id]) : 
                    null);
  
  if (official && official.lines && official.lines.length > 0) {
    const oldLines = [...(station.lines || [])];
    const newLines = [...new Set(official.lines)].sort();
    
    // Update station lines
    station.lines = newLines;
    
    // Also update platform lines if they're empty
    if (station.platforms) {
      station.platforms.forEach(platform => {
        if (!platform.lines || platform.lines.length === 0) {
          platform.lines = newLines;
        }
      });
    }
    
    // Check if actually changed
    if (JSON.stringify(oldLines.sort()) !== JSON.stringify(newLines)) {
      console.log(`✅ ${station.name} (${station.id})`);
      console.log(`   Old: [${oldLines.join(', ') || 'empty'}]`);
      console.log(`   New: [${newLines.join(', ')}]`);
      console.log(`   Matched with: ${official.name}`);
      console.log('');
      updated++;
    } else {
      unchanged++;
    }
  } else if (!station.lines || station.lines.length === 0) {
    console.log(`⚠️  No match found for: ${station.name} (${station.id})`);
    console.log(`   Location: ${station.borough} (${station.latitude}, ${station.longitude})`);
    
    // Try to infer from station ID as last resort
    const inferred = inferLinesFromStationId(station.id);
    if (inferred.length > 0) {
      station.lines = inferred;
      station.platforms?.forEach(platform => {
        if (!platform.lines || platform.lines.length === 0) {
          platform.lines = inferred;
        }
      });
      console.log(`   Inferred lines: [${inferred.join(', ')}]`);
      updated++;
    } else {
      notFound++;
    }
    console.log('');
  } else {
    unchanged++;
  }
  
  return station;
});

// Helper function to infer lines from station ID patterns
function inferLinesFromStationId(stationId) {
  // Common patterns in NYC subway station IDs
  if (/^L\d+/.test(stationId)) return ['L'];
  if (/^1\d{2}$/.test(stationId) && parseInt(stationId) >= 101 && parseInt(stationId) <= 142) return ['1'];
  if (/^2\d{2}$/.test(stationId) && parseInt(stationId) >= 201 && parseInt(stationId) <= 250) return ['2', '3'];
  if (/^4\d{2}$/.test(stationId) && parseInt(stationId) >= 401 && parseInt(stationId) <= 423) return ['4', '5', '6'];
  if (/^6\d{2}$/.test(stationId) && parseInt(stationId) >= 601 && parseInt(stationId) <= 640) return ['6'];
  if (/^7\d{2}$/.test(stationId) && parseInt(stationId) >= 701 && parseInt(stationId) <= 726) return ['7'];
  if (/^A\d+/.test(stationId)) return ['A', 'C', 'E'];
  if (/^B\d+/.test(stationId)) return ['B', 'D', 'F', 'M'];
  if (/^G\d+/.test(stationId)) return ['G'];
  if (/^J\d+/.test(stationId)) return ['J', 'Z'];
  if (/^N\d+/.test(stationId)) return ['N', 'Q', 'R', 'W'];
  if (/^Q\d+/.test(stationId)) return ['Q'];
  if (/^R\d+/.test(stationId)) return ['R'];
  
  return [];
}

// Save merged data
fs.writeFileSync(outputPath, JSON.stringify(mergedStations, null, 2));

// Also update the main stations.json file
fs.writeFileSync(stationsPath, JSON.stringify(mergedStations, null, 2));

console.log('\n📊 Summary:');
console.log(`   Total stations: ${mergedStations.length}`);
console.log(`   Updated: ${updated}`);
console.log(`   Unchanged: ${unchanged}`);
console.log(`   Not found: ${notFound}`);

console.log('\n✅ Station data merge complete!');
console.log(`   Output saved to: stations-merged.json`);
console.log(`   Main file updated: stations.json`);