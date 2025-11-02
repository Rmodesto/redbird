const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const GTFS_URL = 'http://web.mta.info/developers/data/nyct/subway/google_transit.zip';
const TEMP_DIR = path.join(__dirname, '..', 'temp');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure directories exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function downloadGTFS() {
  console.log('Downloading MTA GTFS static data...');
  
  try {
    // Download using curl since node https wasn't working
    execSync(`curl -o ${TEMP_DIR}/google_transit.zip ${GTFS_URL}`, { stdio: 'inherit' });
    
    console.log('Extracting GTFS data...');
    execSync(`cd ${TEMP_DIR} && unzip -o google_transit.zip`, { stdio: 'inherit' });
    
    console.log('Processing stops.txt...');
    const stopsPath = path.join(TEMP_DIR, 'stops.txt');
    const stopsData = fs.readFileSync(stopsPath, 'utf8');
    
    // Parse CSV data
    const lines = stopsData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const stations = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const station = {};
      headers.forEach((header, index) => {
        station[header] = values[index];
      });
      
      stations.push(station);
    }
    
    // Save processed station data
    const outputPath = path.join(DATA_DIR, 'stations.json');
    fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2));
    
    console.log(`Processed ${stations.length} stations and saved to ${outputPath}`);
    
    // Clean up temp files
    execSync(`rm -rf ${TEMP_DIR}`);
    
    return stations;
    
  } catch (error) {
    console.error('Error downloading/processing GTFS data:', error);
    throw error;
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Run if called directly
if (require.main === module) {
  downloadGTFS().catch(console.error);
}

module.exports = { downloadGTFS };