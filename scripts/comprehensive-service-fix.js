const fs = require('fs');
const path = require('path');

// Load station data
const stationsPath = path.join(__dirname, '../data/stations.json');
const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));

console.log('🚇 Comprehensive NYC Subway Service Pattern Correction\n');

// Known routing patterns for NYC subway lines
const lineRouting = {
  // Numbered Lines (IRT)
  '1': {
    boroughs: ['Manhattan', 'Bronx'],
    note: 'Local service Broadway-7th Ave line'
  },
  '2': {
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn'],
    note: 'Express service Broadway-7th Ave line'
  },
  '3': {
    boroughs: ['Manhattan', 'Brooklyn'],
    note: 'Express service Broadway-7th Ave line'
  },
  '4': {
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn'],
    note: 'Express service Lexington Ave line'
  },
  '5': {
    boroughs: ['Manhattan', 'Bronx', 'Brooklyn'],
    note: 'Express service Lexington Ave line'
  },
  '6': {
    boroughs: ['Manhattan', 'Bronx'],
    note: 'Local service Lexington Ave line'
  },
  '7': {
    boroughs: ['Manhattan', 'Queens'],
    note: 'Flushing line'
  },
  
  // Letter Lines (BMT/IND)
  'A': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: '8th Ave Express - does not serve many Brooklyn local stations'
  },
  'B': {
    boroughs: ['Manhattan', 'Brooklyn'],
    note: '6th Ave/Brighton line'
  },
  'C': {
    boroughs: ['Manhattan', 'Brooklyn'],
    note: '8th Ave Local'
  },
  'D': {
    boroughs: ['Manhattan', 'Brooklyn', 'Bronx'],
    note: '6th Ave/Brighton Express'
  },
  'E': {
    boroughs: ['Manhattan', 'Queens'],
    note: '8th Ave line - does NOT go to Brooklyn'
  },
  'F': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: '6th Ave/Culver line'
  },
  'G': {
    boroughs: ['Brooklyn', 'Queens'],
    note: 'Brooklyn-Queens Crosstown - no Manhattan service'
  },
  'J': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Jamaica line'
  },
  'L': {
    boroughs: ['Manhattan', 'Brooklyn'],
    note: '14th St-Canarsie line'
  },
  'M': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Brighton/West End line'
  },
  'N': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Broadway/Sea Beach line'
  },
  'Q': {
    boroughs: ['Manhattan', 'Brooklyn'],
    note: 'Broadway/Brighton Express'
  },
  'R': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Broadway/4th Ave Local'
  },
  'W': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Broadway line (limited service)'
  },
  'Z': {
    boroughs: ['Manhattan', 'Brooklyn', 'Queens'],
    note: 'Jamaica Express (rush hours only)'
  }
};

let errors = [];
let corrected = 0;

// Check each station for invalid line assignments
stations.forEach(station => {
  const invalidLines = [];
  
  station.lines.forEach(line => {
    const routing = lineRouting[line];
    if (routing && !routing.boroughs.includes(station.borough)) {
      invalidLines.push({
        line,
        reason: `${line} train does not serve ${station.borough}`,
        validBoroughs: routing.boroughs,
        note: routing.note
      });
    }
  });
  
  if (invalidLines.length > 0) {
    errors.push({
      station: station,
      invalidLines: invalidLines
    });
  }
});

console.log(`🔍 Found ${errors.length} stations with invalid line assignments:\n`);

// Show first 20 errors for review
errors.slice(0, 20).forEach(error => {
  console.log(`❌ ${error.station.name} (${error.station.borough})`);
  console.log(`   ID: ${error.station.id}, Slug: ${error.station.slug}`);
  console.log(`   Current lines: [${error.station.lines.join(', ')}]`);
  error.invalidLines.forEach(invalid => {
    console.log(`   ⚠️  ${invalid.line}: ${invalid.reason}`);
    console.log(`      Valid boroughs: ${invalid.validBoroughs.join(', ')}`);
  });
  console.log('');
});

if (errors.length > 20) {
  console.log(`... and ${errors.length - 20} more stations with errors\n`);
}

// Auto-fix the obvious geographic errors
console.log('🔧 Auto-fixing geographic routing errors...\n');

stations.forEach(station => {
  const originalLines = [...station.lines];
  
  // Remove lines that don't serve this borough
  station.lines = station.lines.filter(line => {
    const routing = lineRouting[line];
    const isValid = !routing || routing.boroughs.includes(station.borough);
    
    if (!isValid) {
      console.log(`   Removing ${line} from ${station.name} (${station.borough})`);
      corrected++;
    }
    
    return isValid;
  });
  
  // Update platform lines too
  station.platforms.forEach(platform => {
    platform.lines = station.lines;
  });
});

// Write corrected data
fs.writeFileSync(stationsPath, JSON.stringify(stations, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   Invalid assignments found: ${errors.length} stations`);
console.log(`   Line corrections made: ${corrected}`);
console.log(`   Total stations processed: ${stations.length}`);

console.log('\n✅ Geographic routing errors fixed!');
console.log('\n⚠️  Note: This fixes obvious geographic errors (like E train in Brooklyn)');
console.log('   Express vs Local service patterns need manual review with official MTA map');