/**
 * Amenities Enrichment Script
 *
 * This script enriches the stations-normalized.json file with amenities data:
 * - WiFi availability (from NY Open Data)
 * - Restrooms (from MTA official list)
 * - Elevators (inferred from ADA accessibility)
 * - Year built (to be researched separately)
 */

const fs = require('fs');
const path = require('path');

// Load data files
const stationsPath = path.join(__dirname, '../data/stations-normalized.json');
const wifiPath = path.join(__dirname, '../data/mta-wifi-locations.json');
const bathroomsPath = path.join(__dirname, '../data/mta-stations-with-bathrooms.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
const wifiData = JSON.parse(fs.readFileSync(wifiPath, 'utf8'));
const bathroomsData = JSON.parse(fs.readFileSync(bathroomsPath, 'utf8'));

console.log('Loaded data:');
console.log('- Stations:', stations.length);
console.log('- WiFi locations:', wifiData.length);
console.log('- Bathroom locations:', bathroomsData.length);
console.log('');

// Helper function to normalize station names for matching
function normalizeStationName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/street/g, 'st')
    .replace(/avenue/g, 'av')
    .replace(/boulevard/g, 'blvd')
    .replace(/road/g, 'rd')
    .replace(/parkway/g, 'pkwy')
    .replace(/square/g, 'sq')
    .replace(/\bst\b/g, 'st') // Ensure 'st' abbreviation is consistent
    .replace(/(\d+)(st|nd|rd|th)/g, '$1 $2') // Normalize "135th" to "135 th"
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to extract base station name from complex name (removes lines in parentheses)
function extractBaseStationName(complexName) {
  if (!complexName) return '';
  // Remove everything in parentheses like "(2,3)" or "(B,C)"
  return complexName.replace(/\s*\([^)]*\)/, '').trim();
}

// Helper function to check if a station has WiFi/cellular connectivity
function hasWifiConnectivity(wifiStation) {
  return (
    wifiStation.at_t === 'Yes' ||
    wifiStation.sprint === 'Yes' ||
    wifiStation.t_mobile === 'Yes' ||
    wifiStation.verizon === 'Yes'
  );
}

// Build WiFi lookup map by normalized station name and lines
// We'll create a map with keys like "135 st_bc" to match station name + lines
const wifiLookup = new Map();
wifiData.forEach(wifiStation => {
  if (hasWifiConnectivity(wifiStation)) {
    // Use station_complex primarily, fall back to station_name
    const stationName = wifiStation.station_complex || wifiStation.station_name;
    if (stationName) {
      // Extract base name (removing line info in parentheses)
      const baseName = extractBaseStationName(stationName);
      const normalized = normalizeStationName(baseName);

      // Create lookup key with station name + lines (lowercase, no spaces)
      if (wifiStation.lines) {
        const linesKey = wifiStation.lines.toLowerCase().replace(/\s/g, '');
        const lookupKey = `${normalized}_${linesKey}`;
        wifiLookup.set(lookupKey, true);
      }

      // Also add just the station name for broader matching
      wifiLookup.set(normalized, true);
    }
  }
});

// Build bathrooms lookup set
const bathroomsSet = new Set(
  bathroomsData.map(name => normalizeStationName(name))
);

console.log('Lookup tables built:');
console.log('- WiFi stations:', wifiLookup.size);
console.log('- Bathroom stations:', bathroomsSet.size);
console.log('');

// Enrich each station
let wifiMatches = 0;
let bathroomMatches = 0;
let elevatorsCount = 0;

stations.forEach(station => {
  const normalizedName = normalizeStationName(station.name);

  // Check WiFi - try matching with station name + lines first (most specific)
  let hasWifi = false;
  const linesKey = station.lines.join('').toLowerCase();
  const lookupKey = `${normalizedName}_${linesKey}`;

  if (wifiLookup.has(lookupKey)) {
    hasWifi = true;
    wifiMatches++;
  } else if (wifiLookup.has(normalizedName)) {
    // Fall back to just station name if exact match with lines not found
    hasWifi = true;
    wifiMatches++;
  }

  // Check restrooms
  const hasRestrooms = bathroomsSet.has(normalizedName);
  if (hasRestrooms) {
    bathroomMatches++;
  }

  // Elevators - ADA compliant stations must have elevators
  const hasElevators = station.ada === true;
  if (hasElevators) {
    elevatorsCount++;
  }

  // Add amenities object
  station.amenities = {
    wifi: hasWifi,
    restrooms: hasRestrooms,
    elevators: hasElevators,
    yearBuilt: null // To be researched and added later
  };
});

console.log('Enrichment complete:');
console.log('- Stations with WiFi:', wifiMatches);
console.log('- Stations with restrooms:', bathroomMatches);
console.log('- Stations with elevators (ADA):', elevatorsCount);
console.log('');

// Create backup of original file
const backupPath = path.join(__dirname, '../data/stations-normalized-backup.json');
fs.writeFileSync(backupPath, JSON.stringify(stations, null, 2));
console.log('Created backup:', backupPath);

// Save enriched data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));
console.log('Saved enriched data to:', stationsPath);
console.log('');
console.log('✅ Amenities enrichment complete!');

// Show a sample enriched station
const sampleStation = stations.find(s => s.name === '135 St');
if (sampleStation) {
  console.log('\nSample enriched station (135 St):');
  console.log(JSON.stringify({
    name: sampleStation.name,
    ada: sampleStation.ada,
    amenities: sampleStation.amenities
  }, null, 2));
}
