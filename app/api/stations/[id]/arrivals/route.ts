import { NextRequest, NextResponse } from 'next/server';
import { mtaDataService } from '@/lib/services/mta-data-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get station data
    const station = mtaDataService.getStationById(id) || 
                   mtaDataService.getStationBySlug(id);
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    // Get train arrivals
    const arrivals = await mtaDataService.getTrainArrivals(station.id);
    
    // Get service alerts for this station's lines
    const alerts = await mtaDataService.getServiceAlerts(station.lines);

    return NextResponse.json({
      station: {
        id: station.id,
        name: station.name,
        lines: station.lines,
        borough: station.borough
      },
      arrivals,
      alerts,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching arrivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrival data' },
      { status: 500 }
    );
  }
}