const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', 'temp');
const DATA_DIR = path.join(__dirname, '..', 'data');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function createStationSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}

function getBoroughFromCoords(lat, lon) {
  // Rough borough boundaries based on coordinates
  if (lat > 40.8 && lon > -73.9) return "Bronx";
  if (lat > 40.75 && lon < -74.0) return "Staten Island";
  if (lat < 40.7) return "Brooklyn";
  if (lon < -73.95) return "Manhattan";
  return "Queens";
}

function determineLines(stopId) {
  // Map stop ID patterns to subway lines
  const lines = [];
  
  // Extract the line information from stop ID
  const prefix = stopId.replace(/[NS]$/, ''); // Remove direction suffix
  
  // Common patterns for line identification
  if (prefix.startsWith('1') || stopId.match(/^[123]/)) lines.push('1', '2', '3');
  if (prefix.startsWith('4') || prefix.startsWith('5') || prefix.startsWith('6')) lines.push('4', '5', '6');
  if (prefix.startsWith('7')) lines.push('7');
  if (prefix.match(/^[A-H]/)) {
    if (prefix.match(/^[ACE]/)) lines.push('A', 'C', 'E');
    if (prefix.match(/^[BDFM]/)) lines.push('B', 'D', 'F', 'M');
    if (prefix === 'G') lines.push('G');
  }
  if (prefix.match(/^[J-Z]/)) {
    if (prefix.match(/^[JMYZ]/)) lines.push('J', 'M', 'Z');
    if (prefix === 'L') lines.push('L');
    if (prefix.match(/^[NQRW]/)) lines.push('N', 'Q', 'R', 'W');
  }
  
  return [...new Set(lines)]; // Remove duplicates
}

async function processStations() {
  console.log('Processing station data...');
  
  try {
    const stopsPath = path.join(TEMP_DIR, 'stops.txt');
    const stopsData = fs.readFileSync(stopsPath, 'utf8');
    
    const lines = stopsData.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    
    console.log('Headers found:', headers);
    
    const stations = new Map();
    const platformStops = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      
      const stop = {};
      headers.forEach((header, index) => {
        stop[header] = values[index] || '';
      });
      
      // Process parent stations (location_type = 1)
      if (stop.location_type === '1') {
        const slug = createStationSlug(stop.stop_name);
        const borough = getBoroughFromCoords(
          parseFloat(stop.stop_lat), 
          parseFloat(stop.stop_lon)
        );
        
        stations.set(stop.stop_id, {
          id: stop.stop_id,
          name: stop.stop_name,
          slug: slug,
          latitude: parseFloat(stop.stop_lat),
          longitude: parseFloat(stop.stop_lon),
          borough: borough,
          platforms: [],
          lines: [],
          amenities: []
        });
      } else {
        // Process platform stops (location_type = empty, with parent_station)
        platformStops.push(stop);
      }
    }
    
    // Process platform stops and associate with parent stations
    for (const platform of platformStops) {
      const parentId = platform.parent_station;
      const parentStation = stations.get(parentId);
      
      if (parentStation) {
        const direction = platform.stop_id.endsWith('N') ? 'Uptown/Queens' : 
                         platform.stop_id.endsWith('S') ? 'Downtown/Brooklyn' : 'Unknown';
        
        const lines = determineLines(platform.stop_id);
        
        parentStation.platforms.push({
          stopId: platform.stop_id,
          direction: direction,
          lines: lines
        });
        
        // Add lines to parent station
        parentStation.lines = [...new Set([...parentStation.lines, ...lines])];
      }
    }
    
    // Convert to array and sort by name
    const stationsArray = Array.from(stations.values())
      .filter(station => station.platforms.length > 0) // Only include stations with platforms
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Save processed data
    const outputPath = path.join(DATA_DIR, 'stations.json');
    fs.writeFileSync(outputPath, JSON.stringify(stationsArray, null, 2));
    
    // Create lookup files
    const slugLookup = {};
    const stopIdLookup = {};
    
    stationsArray.forEach(station => {
      slugLookup[station.slug] = station.id;
      
      station.platforms.forEach(platform => {
        stopIdLookup[platform.stopId] = {
          stationId: station.id,
          stationName: station.name,
          stationSlug: station.slug,
          direction: platform.direction,
          lines: platform.lines
        };
      });
    });
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'station-slug-lookup.json'),
      JSON.stringify(slugLookup, null, 2)
    );
    
    fs.writeFileSync(
      path.join(DATA_DIR, 'stop-id-lookup.json'),
      JSON.stringify(stopIdLookup, null, 2)
    );
    
    console.log(`✅ Processed ${stationsArray.length} stations`);
    console.log(`✅ Created ${Object.keys(stopIdLookup).length} stop ID mappings`);
    console.log(`✅ Data saved to ${DATA_DIR}/`);
    
    // Show sample data
    console.log('\nSample stations:');
    stationsArray.slice(0, 3).forEach(station => {
      console.log(`- ${station.name} (${station.borough})`);
      console.log(`  Lines: ${station.lines.join(', ')}`);
      console.log(`  Platforms: ${station.platforms.length}`);
    });
    
  } catch (error) {
    console.error('Error processing stations:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  processStations().catch(console.error);
}

module.exports = { processStations };