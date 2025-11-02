#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const STATIONS_FILE = path.join(__dirname, '../data/nyc-subway-stations-official.json');
const BACKUP_FILE = path.join(__dirname, '../data/nyc-subway-stations-original-backup.json');

// Known NYC subway line groupings by infrastructure
const LINE_GROUPS = {
  IRT_LEXINGTON: ['4', '5', '6'],           // Lexington Ave Line
  IRT_BROADWAY: ['1', '2', '3'],            // Broadway-7th Ave Line  
  BMT_BROADWAY: ['N', 'Q', 'R', 'W'],       // Broadway Line (BMT)
  IND_8TH_AVE: ['A', 'B', 'C', 'D'],        // 8th Avenue Line
  IND_6TH_AVE: ['B', 'D', 'F', 'M'],        // 6th Avenue Line
  BMT_4TH_AVE: ['D', 'N', 'R'],             // 4th Avenue Line
  IRT_7: ['7'],                              // Flushing Line
  BMT_CANARSIE: ['L'],                       // Canarsie Line (L)
  BMT_NASSAU: ['J', 'Z'],                    // Nassau Street Line
  IND_CROSSTOWN: ['G'],                      // Crosstown Line
  IRT_JEROME: ['4'],                         // Jerome Ave Line
  IRT_WHITE_PLAINS: ['6'],                   // White Plains Road Line
};

// Street-based station complex definitions
const STATION_COMPLEXES = {
  "103rd St": [
    {
      id: "103rd-st-broadway",
      name: "103rd St - Broadway",
      lines: ["1"],
      coordinates: [-73.968379, 40.799446],
      avenue: "Broadway"
    },
    {
      id: "103rd-st-central-park-west", 
      name: "103rd St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.958150, 40.796060],
      avenue: "Central Park West"
    }
  ],

  "96th St": [
    {
      id: "96th-st-broadway",
      name: "96th St - Broadway", 
      lines: ["1", "2", "3"],
      coordinates: [-73.972323, 40.793919],
      avenue: "Broadway"
    },
    {
      id: "96th-st-central-park-west",
      name: "96th St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.969648, 40.791642],
      avenue: "Central Park West"  
    },
    {
      id: "96th-st-lexington-ave",
      name: "96th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.951822, 40.785672],
      avenue: "Lexington Ave"
    }
  ],

  "86th St": [
    {
      id: "86th-st-broadway",
      name: "86th St - Broadway",
      lines: ["1", "2"],
      coordinates: [-73.976041, 40.788644],
      avenue: "Broadway"
    },
    {
      id: "86th-st-central-park-west",
      name: "86th St - Central Park West", 
      lines: ["B", "C"],
      coordinates: [-73.976229, 40.785672],
      avenue: "Central Park West"
    },
    {
      id: "86th-st-lexington-ave",
      name: "86th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.955589, 40.779492],
      avenue: "Lexington Ave"
    }
  ],

  "72nd St": [
    {
      id: "72nd-st-broadway",
      name: "72nd St - Broadway",
      lines: ["1", "2", "3"],
      coordinates: [-73.981906, 40.778453],
      avenue: "Broadway"
    },
    {
      id: "72nd-st-central-park-west",
      name: "72nd St - Central Park West",
      lines: ["B", "C"],
      coordinates: [-73.975939, 40.775594],
      avenue: "Central Park West"
    }
  ],

  "59th St": [
    {
      id: "59th-st-columbus-circle",
      name: "59th St - Columbus Circle",
      lines: ["1", "2", "A", "B", "C", "D"],
      coordinates: [-73.981929, 40.768247],
      avenue: "Broadway/8th Ave"
    },
    {
      id: "59th-st-lexington-ave", 
      name: "59th St - Lexington Ave",
      lines: ["4", "5", "6"],
      coordinates: [-73.967967, 40.762526],
      avenue: "Lexington Ave"
    }
  ],

  "135th St": [
    {
      id: "135th-st-lenox-ave",
      name: "135th St - Lenox Ave", 
      lines: ["2", "3"],
      coordinates: [-73.940496, 40.814229],
      avenue: "Lenox Ave"
    },
    {
      id: "135th-st-st-nicholas-ave",
      name: "135th St - St Nicholas Ave",
      lines: ["B", "C"],
      coordinates: [-73.947649, 40.817894],
      avenue: "St Nicholas Ave"  
    }
  ],

  "145th St": [
    {
      id: "145th-st-broadway",
      name: "145th St - Broadway",
      lines: ["1"],
      coordinates: [-73.950354, 40.824783],
      avenue: "Broadway"
    },
    {
      id: "145th-st-st-nicholas-ave", 
      name: "145th St - St Nicholas Ave",
      lines: ["A", "B", "C", "D"],
      coordinates: [-73.944216, 40.820421],
      avenue: "St Nicholas Ave"
    }
  ]
};

/**
 * Check if a station needs to be split based on incompatible line groupings
 */
function shouldSplitStation(lines) {
  const groups = new Set();
  
  for (const line of lines) {
    for (const [groupName, groupLines] of Object.entries(LINE_GROUPS)) {
      if (groupLines.includes(line)) {
        groups.add(groupName);
        break;
      }
    }
  }
  
  // If lines belong to more than one group, station should be split
  return groups.size > 1;
}

/**
 * Automatically split a conflated station into separate platform entries
 */
function splitStationComplex(stationName, lines) {
  // Check if we have a predefined complex mapping
  if (STATION_COMPLEXES[stationName]) {
    return STATION_COMPLEXES[stationName].filter(platform => 
      platform.lines.some(line => lines.includes(line))
    );
  }

  // For now, return empty array if no predefined mapping
  // Could add auto-detection logic later
  return [];
}

/**
 * Analyze and fix all conflated stations in the dataset
 */
function fixAllStationComplexes() {
  console.log('🔍 Loading station data...');
  
  // Read current station data
  const fileData = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
  const stationsData = fileData.stations;
  
  // Create backup if it doesn't exist
  if (!fs.existsSync(BACKUP_FILE)) {
    console.log('💾 Creating backup of original data...');
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(fileData, null, 2));
  }

  console.log(`📊 Analyzing ${stationsData.length} stations...`);

  const conflatedStations = [];
  const fixedStations = [];
  
  for (const station of stationsData) {
    if (shouldSplitStation(station.lines)) {
      conflatedStations.push(station);
      console.log(`🚇 Found conflated station: ${station.name} (${station.lines.join(', ')})`);
      
      // Split this station into multiple platforms
      const platforms = splitStationComplex(station.name, station.lines);
      
      if (platforms.length > 0) {
        platforms.forEach(platform => {
          fixedStations.push({
            ...station,
            id: platform.id,
            name: platform.name,
            lines: platform.lines,
            coordinates: platform.coordinates,
            avenue: platform.avenue,
            originalId: station.id,
          });
          console.log(`  ✅ Split into: ${platform.name} (${platform.lines.join(', ')})`);
        });
      } else {
        // Keep original if no split mapping available
        fixedStations.push(station);
        console.log(`  ⚠️  No mapping available, keeping original`);
      }
    } else {
      // Keep non-conflated stations as-is
      fixedStations.push(station);
    }
  }

  console.log(`\n📈 Results:`);
  console.log(`  • Original stations: ${stationsData.length}`);
  console.log(`  • Conflated stations found: ${conflatedStations.length}`);
  console.log(`  • Fixed stations total: ${fixedStations.length}`);
  console.log(`  • Net stations added: ${fixedStations.length - stationsData.length}`);

  // Write the fixed dataset
  console.log('\n💾 Writing fixed dataset...');
  const updatedFileData = {
    ...fileData,
    stations: fixedStations,
    total_stations: fixedStations.length
  };
  fs.writeFileSync(STATIONS_FILE, JSON.stringify(updatedFileData, null, 2));
  
  console.log('✨ Station complex fixes applied successfully!');
  
  // List all conflated stations that were found
  console.log('\n🏗️  Conflated stations that were processed:');
  conflatedStations.forEach(station => {
    console.log(`  • ${station.name} (${station.lines.join(', ')})`);
  });
}

// Run the fix
if (require.main === module) {
  fixAllStationComplexes();
}

module.exports = { fixAllStationComplexes };