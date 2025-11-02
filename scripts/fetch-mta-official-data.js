const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🚇 Fetching official MTA Subway Stations data from data.ny.gov...\n');

// NY Open Data API endpoint for MTA Subway Stations dataset
// Dataset: https://data.ny.gov/Transportation/MTA-Subway-Stations/39hk-dx4f
const API_URL = 'https://data.ny.gov/resource/39hk-dx4f.json?$limit=5000';

function fetchData() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
      
      res.on('error', reject);
    });
  });
}

async function main() {
  try {
    console.log('Fetching data from NY Open Data API...');
    const stations = await fetchData();
    
    console.log(`✅ Fetched ${stations.length} stations\n`);
    
    // Save raw data for inspection
    const outputPath = path.join(__dirname, '../data/mta-official-api-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(stations, null, 2));
    console.log(`Raw data saved to: ${outputPath}\n`);
    
    // Let's examine the structure
    if (stations.length > 0) {
      console.log('Sample station structure:');
      console.log(JSON.stringify(stations[0], null, 2));
      console.log('\n');
      
      // Count unique fields
      const fields = new Set();
      stations.forEach(station => {
        Object.keys(station).forEach(key => fields.add(key));
      });
      
      console.log('Available fields:', Array.from(fields).sort().join(', '));
      console.log('\n');
      
      // Look for line information fields
      const lineFields = Array.from(fields).filter(f => 
        f.toLowerCase().includes('line') || 
        f.toLowerCase().includes('train') ||
        f.toLowerCase().includes('route') ||
        f.toLowerCase().includes('service')
      );
      
      if (lineFields.length > 0) {
        console.log('Potential line/service fields found:', lineFields);
        
        // Show sample values for these fields
        lineFields.forEach(field => {
          const samples = stations
            .filter(s => s[field])
            .slice(0, 5)
            .map(s => ({name: s.stop_name || s.station_name, value: s[field]}));
          
          if (samples.length > 0) {
            console.log(`\nSample values for "${field}":`);
            samples.forEach(sample => {
              console.log(`  ${sample.name}: ${sample.value}`);
            });
          }
        });
      } else {
        console.log('⚠️  No obvious line/service fields found. Checking all fields for line data...\n');
        
        // Check if lines are embedded in other fields
        const sampleStation = stations.find(s => 
          Object.values(s).some(v => 
            typeof v === 'string' && /[1-7ABCDEFGJLMNQRSWZ]/.test(v) && v.length <= 10
          )
        );
        
        if (sampleStation) {
          console.log('Station with potential line data:');
          console.log(JSON.stringify(sampleStation, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

main();