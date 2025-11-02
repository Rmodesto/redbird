const fs = require('fs');
const path = require('path');

console.log('🚇 Normalizing MTA station data using complex_id...\n');

// Load MTA official data
const dataDir = path.join(__dirname, '../data');
const officialDataPath = path.join(dataDir, 'mta-official-api-data.json');
const outputPath = path.join(dataDir, 'stations-normalized.json');

const mtaStations = JSON.parse(fs.readFileSync(officialDataPath, 'utf8'));

// Group stations by complex_id
const complexes = new Map();

mtaStations.forEach(station => {
  const complexId = station.complex_id;
  
  if (!complexes.has(complexId)) {
    complexes.set(complexId, {
      complex_id: complexId,
      name: station.stop_name,
      borough: station.borough === 'M' ? 'Manhattan' :
               station.borough === 'Bk' ? 'Brooklyn' :
               station.borough === 'Q' ? 'Queens' :
               station.borough === 'Bx' ? 'Bronx' : 'Staten Island',
      lines: new Set(),
      platforms: [],
      coordinates: [],
      ada: false,
      divisions: new Set()
    });
  }
  
  const complex = complexes.get(complexId);
  
  // Add lines from daytime_routes
  if (station.daytime_routes) {
    const lines = station.daytime_routes.trim().split(/\s+/)
      .filter(line => line && /^[1-7ABCDEFGJLMNQRSWZ]$/.test(line));
    lines.forEach(line => complex.lines.add(line));
  }
  
  // Add platform info
  complex.platforms.push({
    gtfs_stop_id: station.gtfs_stop_id,
    direction_label: {
      north: station.north_direction_label,
      south: station.south_direction_label
    },
    lines: station.daytime_routes
  });
  
  // Add coordinates
  complex.coordinates.push({
    lat: parseFloat(station.gtfs_latitude),
    lng: parseFloat(station.gtfs_longitude)
  });
  
  // Check ADA accessibility
  if (station.ada === '1' || station.ada === 'true') {
    complex.ada = true;
  }
  
  // Track divisions (IRT, BMT, IND)
  if (station.division) {
    complex.divisions.add(station.division);
  }
});

// Convert to normalized stations array
const normalizedStations = [];

for (const [complexId, complex] of complexes.entries()) {
  // Calculate average coordinates for the complex
  const avgLat = complex.coordinates.reduce((sum, c) => sum + c.lat, 0) / complex.coordinates.length;
  const avgLng = complex.coordinates.reduce((sum, c) => sum + c.lng, 0) / complex.coordinates.length;
  
  // Create slug from name
  const slug = complex.name.toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  
  normalizedStations.push({
    id: complexId,
    name: complex.name,
    slug: slug,
    borough: complex.borough,
    latitude: avgLat,
    longitude: avgLng,
    lines: Array.from(complex.lines).sort(),
    platforms: complex.platforms,
    ada: complex.ada,
    divisions: Array.from(complex.divisions),
    platform_count: complex.platforms.length
  });
}

// Sort by name for consistency
normalizedStations.sort((a, b) => a.name.localeCompare(b.name));

// Save normalized data
fs.writeFileSync(outputPath, JSON.stringify(normalizedStations, null, 2));

// Generate statistics
const stats = {
  total_complexes: normalizedStations.length,
  total_platforms: mtaStations.length,
  by_borough: {},
  by_lines: {},
  multi_division_stations: [],
  ada_accessible: 0
};

normalizedStations.forEach(station => {
  // Borough stats
  if (!stats.by_borough[station.borough]) {
    stats.by_borough[station.borough] = 0;
  }
  stats.by_borough[station.borough]++;
  
  // Line stats
  station.lines.forEach(line => {
    if (!stats.by_lines[line]) {
      stats.by_lines[line] = 0;
    }
    stats.by_lines[line]++;
  });
  
  // Multi-division stations (interesting transfers)
  if (station.divisions.length > 1) {
    stats.multi_division_stations.push({
      name: station.name,
      divisions: station.divisions,
      lines: station.lines
    });
  }
  
  // ADA stats
  if (station.ada) {
    stats.ada_accessible++;
  }
});

console.log('📊 Normalization Results:');
console.log(`   Original platform entries: ${mtaStations.length}`);
console.log(`   Normalized station complexes: ${normalizedStations.length}`);
console.log(`   Reduction: ${mtaStations.length - normalizedStations.length} entries consolidated\n`);

console.log('🗽 Stations by Borough:');
Object.entries(stats.by_borough).forEach(([borough, count]) => {
  console.log(`   ${borough}: ${count} stations`);
});

console.log('\n🚊 Stations by Line:');
Object.entries(stats.by_lines)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([line, count]) => {
    console.log(`   ${line}: ${count} stations`);
  });

console.log(`\n♿ ADA Accessible: ${stats.ada_accessible} stations (${(stats.ada_accessible / normalizedStations.length * 100).toFixed(1)}%)`);

console.log('\n🔄 Multi-Division Transfer Stations:');
stats.multi_division_stations.slice(0, 10).forEach(station => {
  console.log(`   ${station.name}: ${station.divisions.join('/')} - [${station.lines.join(', ')}]`);
});

console.log('\n✅ Normalized data saved to: stations-normalized.json');

// Also create a mapping file for reference
const mappingData = {
  created: new Date().toISOString(),
  source: 'NY Open Data - MTA Subway Stations',
  normalization_method: 'complex_id grouping',
  statistics: stats
};

fs.writeFileSync(
  path.join(dataDir, 'normalization-report.json'),
  JSON.stringify(mappingData, null, 2)
);

console.log('📄 Report saved to: normalization-report.json');