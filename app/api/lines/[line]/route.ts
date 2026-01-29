import { NextRequest } from 'next/server';
import { mtaDataService } from '@/lib/services/mta-data-service';
import { apiSuccess, notFound, serverError, CACHE_HEADERS } from '@/lib/api/responses';

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
      return notFound('Line not found');
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

    return apiSuccess(
      {
        line: lineInfo,
        stations,
        stationsByBorough,
        alerts,
        metadata: {
          totalStations: stations.length,
          boroughsServed: Object.keys(stationsByBorough),
          terminals: lineInfo.terminals
        }
      },
      CACHE_HEADERS.MEDIUM
    );

  } catch (error) {
    console.error('[API /lines/[line]] Error:', error);
    return serverError('Failed to fetch line data');
  }
}