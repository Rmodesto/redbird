const fs = require('fs');
const path = require('path');

// Read the official MTA GeoJSON data
const mtaGeoJSON = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../data/mta-official-stations.geojson'), 
  'utf8'
));

// Helper function to extract station info from HTML description
function parseDescription(description) {
  const nameMatch = description.match(/NAME<\/span>:<\/strong> <span class="atr-value">([^<]+)<\/span>/);
  const lineMatch = description.match(/LINE<\/span>:<\/strong> <span class="atr-value">([^<]+)<\/span>/);
  
  const name = nameMatch ? nameMatch[1].trim() : '';
  const linesString = lineMatch ? lineMatch[1].trim() : '';
  
  // Parse lines - handle various formats
  const lines = linesString
    .split('-')
    .map(line => line.trim())
    .filter(line => line && line !== '6 Express')
    .map(line => {
      // Handle express services
      if (line === '6 Express') return '6';
      return line;
    })
    .filter(line => line.match(/^[A-Z0-9]$/));
  
  return { name, lines };
}

// Helper function to determine borough from coordinates
function getBoroughFromCoordinates(lng, lat) {
  // Rough coordinate boundaries for NYC boroughs
  if (lng > -73.95 && lat > 40.72 && lat < 40.83) return 'Manhattan';
  if (lng < -73.95 && lat > 40.57 && lat < 40.74) return 'Brooklyn';
  if (lng < -73.82 && lat > 40.73) return 'Queens';
  if (lat > 40.83) return 'Bronx';
  if (lng < -74.15) return 'Staten Island';
  
  // Default based on coordinates
  if (lat > 40.79) return 'Bronx';
  if (lng < -73.96) return 'Brooklyn';
  if (lng < -73.90) return 'Queens';
  return 'Manhattan';
}

// Convert GeoJSON to our station format
const stations = mtaGeoJSON.features.map((feature, index) => {
  const [lng, lat] = feature.geometry.coordinates;
  const { name, lines } = parseDescription(feature.properties.description);
  
  if (!name || lines.length === 0) {
    console.warn(`Skipping station ${index}: missing name or lines`);
    return null;
  }
  
  const id = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  
  return {
    id,
    name,
    lines,
    coordinates: [lng, lat],
    borough: getBoroughFromCoordinates(lng, lat)
  };
}).filter(station => station !== null);

// Remove duplicates based on name
const uniqueStations = [];
const seenNames = new Set();

stations.forEach(station => {
  if (!seenNames.has(station.name)) {
    seenNames.add(station.name);
    uniqueStations.push(station);
  }
});

console.log(`Processed ${uniqueStations.length} unique stations`);

// Create the final dataset
const dataset = {
  version: "2.0",
  source: "MTA Official GeoJSON via NYC Open GeoJSON",
  updated: new Date().toISOString(),
  total_stations: uniqueStations.length,
  stations: uniqueStations.sort((a, b) => a.name.localeCompare(b.name))
};

// Write to our data file
fs.writeFileSync(
  path.join(__dirname, '../data/nyc-subway-stations-official.json'),
  JSON.stringify(dataset, null, 2)
);

console.log('✅ Updated station coordinates with official MTA data');
console.log(`📍 ${dataset.total_stations} stations with accurate coordinates`);