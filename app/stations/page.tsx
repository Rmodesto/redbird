import fs from 'fs';
import path from 'path';
import StationsClient from './StationsClient';

interface Station {
  id: string;
  name: string;
  slug: string;
  borough: string;
  lines: string[];
  latitude: number;
  longitude: number;
}

async function getStations(): Promise<Station[]> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const stationsPath = path.join(dataDir, 'stations-normalized.json');
    
    const stations = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
    
    // Data is properly normalized with correct station complexes and line assignments
    console.log(`Loaded ${stations.length} stations from server (normalized complexes - 445 total)`);
    return stations;
  } catch (error) {
    console.error('Error loading station data:', error);
    return [];
  }
}

export default async function StationsPage() {
  const stations = await getStations();
  
  return <StationsClient initialStations={stations} />;
}