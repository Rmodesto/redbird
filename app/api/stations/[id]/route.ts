import { NextRequest } from 'next/server';
import { mtaDataService } from '@/lib/services/mta-data-service';
import { apiSuccess, notFound, serverError, CACHE_HEADERS } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try to get station by GTFS ID first, then by slug
    const station = mtaDataService.getStationById(id) ||
                   mtaDataService.getStationBySlug(id);

    if (!station) {
      return notFound('Station not found');
    }

    // Get line information for each line serving this station
    const lineInfo = station.lines.map(line =>
      mtaDataService.getLineInfo(line)
    ).filter(info => info !== null);

    // Get nearby stations
    const nearbyStations = mtaDataService.getNearbyStations(
      station.latitude,
      station.longitude,
      0.5 // 500 meters radius
    ).filter(s => s.id !== station.id).slice(0, 5);

    return apiSuccess(
      {
        station,
        lineInfo,
        nearbyStations,
        metadata: {
          totalLines: station.lines.length,
          isAccessible: station.amenities?.elevators || false,
          hasWifi: station.amenities?.wifi || false,
          borough: station.borough
        }
      },
      CACHE_HEADERS.MEDIUM
    );

  } catch (error) {
    console.error('[API /stations/[id]] Error:', error);
    return serverError('Failed to fetch station data');
  }
}