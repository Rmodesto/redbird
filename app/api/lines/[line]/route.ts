import { NextRequest, NextResponse } from 'next/server';
import { mtaDataService } from '@/lib/services/mta-data-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { line: string } }
) {
  try {
    const { line } = params;
    const lineUpper = line.toUpperCase();
    
    // Get line information
    const lineInfo = mtaDataService.getLineInfo(lineUpper);
    
    if (!lineInfo) {
      return NextResponse.json(
        { error: 'Line not found' },
        { status: 404 }
      );
    }

    // Get all stations on this line
    const stations = mtaDataService.getStationsByLine(lineUpper);
    
    // Get service alerts for this line
    const alerts = await mtaDataService.getServiceAlerts([lineUpper]);

    // Group stations by borough
    const stationsByBorough = stations.reduce((acc, station) => {
      if (!acc[station.borough]) {
        acc[station.borough] = [];
      }
      acc[station.borough].push(station);
      return acc;
    }, {} as Record<string, typeof stations>);

    return NextResponse.json({
      line: lineInfo,
      stations,
      stationsByBorough,
      alerts,
      metadata: {
        totalStations: stations.length,
        boroughsServed: Object.keys(stationsByBorough),
        terminals: lineInfo.terminals
      }
    });

  } catch (error) {
    console.error('Error fetching line data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch line data' },
      { status: 500 }
    );
  }
}