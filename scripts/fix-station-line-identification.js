const fs = require('fs');
const path = require('path');

// Load station data
const stationsPath = path.join(__dirname, '../data/stations.json');
const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));

console.log('🚇 Fixing station line identification and naming\n');

// NYC Subway line groupings by actual subway lines
const subwayLines = {
  // IRT Lines (numbered trains)
  'broadway-7th-ave': {
    trains: ['1', '2', '3'],
    name: 'Broadway-7th Ave Line',
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn']
  },
  'lexington-ave': {
    trains: ['4', '5', '6'],
    name: 'Lexington Ave Line', 
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn']
  },
  'flushing': {
    trains: ['7'],
    name: 'Flushing Line',
    boroughs: ['Manhattan', 'Queens']
  },
  
  // BMT/IND Lines (lettered trains)
  '8th-ave': {
    trains: ['A', 'C', 'E'],
    name: '8th Ave Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'] // E only goes to Queens, A/C to Brooklyn
  },
  '6th-ave-broadway': {
    trains: ['B', 'D', 'F', 'M'],
    name: '6th Ave Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'broadway-bmt': {
    trains: ['N', 'Q', 'R', 'W'],
    name: 'Broadway Line (BMT)',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'jamaica': {
    trains: ['J', 'Z'],
    name: 'Jamaica Line',
    boroughs: ['Manhattan', 'Brooklyn', 'Queens']
  },
  'canarsie': {
    trains: ['L'],
    name: '14th St-Canarsie Line',
    boroughs: ['Manhattan', 'Brooklyn']
  },
  'crosstown': {
    trains: ['G'],
    name: 'Brooklyn-Queens Crosstown',
    boroughs: ['Brooklyn', 'Queens']
  }
};

// Function to identify which subway line a station belongs to
function identifySubwayLine(station) {
  if (station.lines.length === 0) {
    return null; // Can't identify without lines
  }
  
  // Find the line group that matches the station's trains
  for (const [lineKey, lineInfo] of Object.entries(subwayLines)) {
    const stationTrains = station.lines;
    const lineTrains = lineInfo.trains;
    
    // Check if all station trains belong to this line group
    const matchingTrains = stationTrains.filter(train => lineTrains.includes(train));
    
    if (matchingTrains.length === stationTrains.length && matchingTrains.length > 0) {
      return {
        key: lineKey,
        info: lineInfo,
        matchingTrains
      };
    }
  }
  
  return null;
}

// Function to check if borough assignment makes sense
function validateBorough(station, identifiedLine) {
  if (!identifiedLine) return true;
  
  return identifiedLine.info.boroughs.includes(station.borough);
}

let corrections = 0;
let boroughFixes = 0;
let namingUpdates = 0;

console.log('🔍 Analyzing station line assignments...\n');

// First pass: fix obvious misassignments
stations.forEach(station => {
  const identifiedLine = identifySubwayLine(station);
  
  if (identifiedLine) {
    // Check if borough is correct
    const boroughValid = validateBorough(station, identifiedLine);
    
    if (!boroughValid) {
      console.log(`🔧 Borough correction needed: ${station.name} (${station.id})`);
      console.log(`   Current: ${station.borough}`);
      console.log(`   Line: ${identifiedLine.info.name} [${identifiedLine.matchingTrains.join(', ')}]`);
      console.log(`   Valid boroughs: ${identifiedLine.info.boroughs.join(', ')}`);
      
      // For stations that are clearly in wrong borough, fix the most obvious ones
      if (station.borough === 'Queens' && identifiedLine.key === 'broadway-7th-ave') {
        station.borough = 'Manhattan';
        console.log(`   ✅ Fixed to: Manhattan`);
        boroughFixes++;
      } else if (station.borough === 'Queens' && identifiedLine.key === 'lexington-ave') {
        station.borough = 'Manhattan';
        console.log(`   ✅ Fixed to: Manhattan`);
        boroughFixes++;
      }
      console.log('');
    }
    
    // Update station name to include line identifier for clarity
    if (!station.name.includes('Line') && !station.name.includes('Ave') && !station.name.includes('Sq')) {
      const currentName = station.name;
      
      // Only update generic street names
      if (/^\d+\s+St$/.test(currentName)) {
        const lineIdentifier = identifiedLine.info.name.split(' ')[0]; // Get first word (Broadway, Lexington, etc.)
        station.name = `${currentName} (${lineIdentifier})`;
        console.log(`📝 Name update: ${currentName} → ${station.name} [${identifiedLine.matchingTrains.join(', ')}]`);
        namingUpdates++;
      }
    }
    
    corrections++;
  } else if (station.lines.length === 0) {
    console.log(`⚠️  Empty lines: ${station.name} (${station.id}) in ${station.borough}`);
  }
});

// Regenerate slugs for updated names
stations.forEach(station => {
  const newSlug = station.name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
    
  if (station.slug !== newSlug) {
    console.log(`🔗 Slug update: ${station.slug} → ${newSlug}`);
    station.slug = newSlug;
  }
});

// Write updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

// Update slug lookup
const newSlugLookup = {};
stations.forEach(station => {
  newSlugLookup[station.slug] = station.id;
});

const slugLookupPath = path.join(__dirname, '../data/station-slug-lookup.json');
fs.writeFileSync(slugLookupPath, JSON.stringify(newSlugLookup, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   Stations analyzed: ${stations.length}`);
console.log(`   Line identifications: ${corrections}`);
console.log(`   Borough fixes: ${boroughFixes}`);
console.log(`   Name updates: ${namingUpdates}`);

console.log('\n✅ Station line identification complete!');