const fs = require('fs');
const path = require('path');

// Load current station data
const stationsPath = path.join(__dirname, '../data/stations.json');
const slugLookupPath = path.join(__dirname, '../data/station-slug-lookup.json');

const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));

// Function to create a basic slug
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single
    .trim();
}

// Function to create unique slug
function createUniqueSlug(station, existingSlugs) {
  let baseSlug = createSlug(station.name);
  
  // If this slug already exists, make it unique
  if (existingSlugs.has(baseSlug)) {
    // Add borough as differentiator
    const borgSlug = `${baseSlug}-${station.borough.toLowerCase()}`;
    if (!existingSlugs.has(borgSlug)) {
      return borgSlug;
    }
    
    // If borough still conflicts, add line info
    const primaryLine = station.lines && station.lines.length > 0 ? station.lines[0] : '';
    if (primaryLine) {
      const lineSlug = `${baseSlug}-${primaryLine}`;
      if (!existingSlugs.has(lineSlug)) {
        return lineSlug;
      }
    }
    
    // Last resort: add station ID
    return `${baseSlug}-${station.id}`;
  }
  
  return baseSlug;
}

// Track existing slugs and create new unique ones
const existingSlugs = new Set();
const newSlugLookup = {};

// First pass: identify conflicts
const slugCounts = {};
stations.forEach(station => {
  const baseSlug = createSlug(station.name);
  slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
});

// Second pass: create unique slugs
stations.forEach(station => {
  const baseSlug = createSlug(station.name);
  
  // If there's only one station with this name, keep the simple slug
  if (slugCounts[baseSlug] === 1) {
    station.slug = baseSlug;
    existingSlugs.add(baseSlug);
    newSlugLookup[baseSlug] = station.id;
  } else {
    // Multiple stations with same name - make unique
    let uniqueSlug;
    
    // Strategy: Add borough if different stations are in different boroughs
    const borgSlug = `${baseSlug}-${station.borough.toLowerCase()}`;
    if (!existingSlugs.has(borgSlug)) {
      uniqueSlug = borgSlug;
    } else {
      // Add primary line as differentiator
      const primaryLine = station.lines && station.lines.length > 0 ? station.lines[0].toLowerCase() : '';
      if (primaryLine) {
        uniqueSlug = `${baseSlug}-${primaryLine}`;
      }
      
      // Last resort: use station ID
      if (!uniqueSlug || existingSlugs.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${station.id.toLowerCase()}`;
      }
    }
    
    station.slug = uniqueSlug;
    existingSlugs.add(uniqueSlug);
    newSlugLookup[uniqueSlug] = station.id;
  }
});

// Write updated data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));
fs.writeFileSync(slugLookupPath, JSON.stringify(newSlugLookup, null, 2));

console.log('✅ Fixed station slugs!');
console.log(`📊 Processed ${stations.length} stations`);
console.log(`🔗 Created ${Object.keys(newSlugLookup).length} unique slugs`);

// Show examples of what changed
const examples = stations
  .filter(s => s.name.includes('103 St') || s.name.includes('125 St') || s.name.includes('116 St'))
  .map(s => `${s.name} (${s.borough}) → ${s.slug} [${s.lines.join(',')}]`)
  .slice(0, 10);

console.log('\n📝 Examples of updated slugs:');
examples.forEach(ex => console.log(`  ${ex}`));