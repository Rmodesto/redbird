import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

interface Station {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  borough: string;
  platforms: Platform[];
  lines: string[];
  amenities: string[];
}

let stationsData: Station[] | null = null;
let slugLookup: Record<string, string> | null = null;

function loadStationData() {
  if (!stationsData) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      const stationsPath = path.join(dataDir, 'stations.json');
      const slugLookupPath = path.join(dataDir, 'station-slug-lookup.json');
      
      stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      slugLookup = JSON.parse(fs.readFileSync(slugLookupPath, 'utf8'));
      
    } catch (error) {
      console.error('Error loading station data:', error);
      throw error;
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    loadStationData();
    
    const slug = params.slug;
    
    if (!stationsData || !slugLookup) {
      throw new Error('Station data not loaded');
    }
    
    // Find station by slug
    const station = stationsData.find(s => s.slug === slug);
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Add some additional metadata
    const enrichedStation = {
      ...station,
      accessibility: {
        elevator: Math.random() > 0.7, // Mock data
        escalator: Math.random() > 0.5,
        wheelchair: Math.random() > 0.8
      },
      nearbyPlaces: [
        // This would typically come from a separate database or API
        { name: "Coffee Shop", type: "food", distance: 0.1 },
        { name: "Restaurant", type: "food", distance: 0.2 },
        { name: "Bank", type: "services", distance: 0.1 }
      ].filter(() => Math.random() > 0.3), // Random subset
      transfers: station.platforms
        .flatMap(p => p.lines)
        .filter((line, index, arr) => arr.indexOf(line) === index) // unique lines
    };
    
    return NextResponse.json(enrichedStation);
    
  } catch (error) {
    console.error('Error in station API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station data' },
      { status: 500 }
    );
  }
}