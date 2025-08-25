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
let stopIdLookup: Record<string, any> | null = null;

function loadStationData() {
  if (!stationsData) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      
      const stationsPath = path.join(dataDir, 'stations.json');
      const slugLookupPath = path.join(dataDir, 'station-slug-lookup.json');
      const stopIdLookupPath = path.join(dataDir, 'stop-id-lookup.json');
      
      stationsData = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
      slugLookup = JSON.parse(fs.readFileSync(slugLookupPath, 'utf8'));
      stopIdLookup = JSON.parse(fs.readFileSync(stopIdLookupPath, 'utf8'));
      
      console.log(`Loaded ${stationsData.length} stations`);
    } catch (error) {
      console.error('Error loading station data:', error);
      throw error;
    }
  }
}

export async function GET(request: Request) {
  try {
    loadStationData();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const borough = searchParams.get('borough');
    const line = searchParams.get('line');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let filteredStations = [...(stationsData || [])];
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStations = filteredStations.filter(station => 
        station.name.toLowerCase().includes(searchLower) ||
        station.slug.includes(searchLower) ||
        station.borough.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by borough
    if (borough) {
      filteredStations = filteredStations.filter(station =>
        station.borough.toLowerCase() === borough.toLowerCase()
      );
    }
    
    // Filter by line
    if (line) {
      filteredStations = filteredStations.filter(station =>
        station.lines.includes(line.toUpperCase())
      );
    }
    
    // Limit results
    filteredStations = filteredStations.slice(0, limit);
    
    return NextResponse.json({
      stations: filteredStations,
      total: filteredStations.length,
      filters: { search, borough, line, limit }
    });
    
  } catch (error) {
    console.error('Error in stations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station data' },
      { status: 500 }
    );
  }
}