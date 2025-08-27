const fs = require('fs');
const path = require('path');

// Load station data
const stationsPath = path.join(__dirname, '../data/stations.json');
const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));

console.log('🔍 Finding stations with incorrect borough assignments based on line service...');

// Known line-to-borough mappings (general patterns)
const linePatterns = {
  '1': ['Manhattan', 'Bronx'],
  '2': ['Manhattan', 'Bronx', 'Brooklyn'], 
  '3': ['Manhattan', 'Brooklyn'],
  '4': ['Manhattan', 'Bronx', 'Brooklyn'],
  '5': ['Manhattan', 'Bronx', 'Brooklyn'],
  '6': ['Manhattan', 'Bronx'],
  '7': ['Manhattan', 'Queens'],
  'A': ['Manhattan', 'Brooklyn', 'Queens'],
  'C': ['Manhattan', 'Brooklyn'],
  'E': ['Manhattan', 'Queens'],
  'B': ['Manhattan', 'Brooklyn'],
  'D': ['Manhattan', 'Brooklyn', 'Bronx'],
  'F': ['Manhattan', 'Brooklyn', 'Queens'],
  'M': ['Manhattan', 'Brooklyn', 'Queens'],
  'G': ['Brooklyn', 'Queens'],
  'J': ['Manhattan', 'Brooklyn', 'Queens'],
  'Z': ['Manhattan', 'Brooklyn', 'Queens'],
  'L': ['Manhattan', 'Brooklyn'],
  'N': ['Manhattan', 'Brooklyn', 'Queens'],
  'Q': ['Manhattan', 'Brooklyn'],
  'R': ['Manhattan', 'Brooklyn', 'Queens'],
  'W': ['Manhattan', 'Brooklyn', 'Queens']
};

// Specific corrections based on known geographic issues
const corrections = [
  {
    id: '226',
    name: '116 St', 
    currentBorough: 'Queens',
    correctBorough: 'Manhattan',
    reason: 'Lines 1,2,3 do not run in Queens. Coordinates -73.949625 indicate Manhattan location.'
  },
  // Add more corrections as needed
];

let corrected = 0;

corrections.forEach(correction => {
  const station = stations.find(s => s.id === correction.id);
  if (station) {
    console.log(`🔧 Correcting Station ${correction.id}: ${correction.name}`);
    console.log(`   ${correction.currentBorough} → ${correction.correctBorough}`);
    console.log(`   Reason: ${correction.reason}`);
    console.log(`   Lines: ${station.lines.join(', ')}`);
    console.log(`   Coordinates: ${station.latitude}, ${station.longitude}`);
    
    station.borough = correction.correctBorough;
    
    // Update slug to reflect correct borough
    const oldSlug = station.slug;
    station.slug = station.slug.replace('-queens', '-manhattan');
    console.log(`   Slug: ${oldSlug} → ${station.slug}`);
    console.log('');
    
    corrected++;
  }
});

// Write corrected data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

console.log(`✅ Corrected ${corrected} station borough assignments`);

// Regenerate slug lookup
const newSlugLookup = {};
stations.forEach(station => {
  newSlugLookup[station.slug] = station.id;
});

const slugLookupPath = path.join(__dirname, '../data/station-slug-lookup.json');
fs.writeFileSync(slugLookupPath, JSON.stringify(newSlugLookup, null, 2));

console.log('🔗 Updated slug lookup file');