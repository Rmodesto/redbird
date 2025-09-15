#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read stations data
const stationsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stations.json'), 'utf8'));

// Group stations by line
const lineStations = {};

stationsData.forEach(station => {
  if (station.lines && station.lines.length > 0) {
    station.lines.forEach(line => {
      if (!lineStations[line]) {
        lineStations[line] = [];
      }
      lineStations[line].push({
        id: station.id,
        name: station.name,
        slug: station.slug || station.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        borough: station.borough || 'Manhattan',
        coordinates: station.coordinates
      });
    });
  }
});

// Sort lines
const sortedLines = Object.keys(lineStations).sort();

console.log('Subway Lines Station Data\n');
console.log('=========================\n');

sortedLines.forEach(line => {
  const stations = lineStations[line];
  console.log(`\nLine ${line}: ${stations.length} stations`);
  console.log('-'.repeat(40));
  
  // Sort stations by name for now (ideally would be by route order)
  stations.sort((a, b) => a.name.localeCompare(b.name));
  
  stations.forEach((station, index) => {
    console.log(`  ${index + 1}. ${station.name} (${station.borough}) - slug: ${station.slug}`);
  });
});

// Output summary
console.log('\n\nSUMMARY');
console.log('=======');
sortedLines.forEach(line => {
  console.log(`Line ${line}: ${lineStations[line].length} stations`);
});

// Save to JSON file for reference
const output = {
  generated: new Date().toISOString(),
  lines: {}
};

sortedLines.forEach(line => {
  output.lines[line] = {
    stations: lineStations[line],
    count: lineStations[line].length
  };
});

fs.writeFileSync(
  path.join(__dirname, '../data/line-stations-extracted.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n\nData saved to data/line-stations-extracted.json');