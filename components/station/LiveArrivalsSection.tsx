'use client';

import { useState, useEffect, useCallback } from 'react';

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  arrivalTime: number;
  minutesUntil: number;
  stopId: string;
  tripId: string;
}

interface ArrivalsResponse {
  station: {
    id: string;
    name: string;
    slug: string;
  };
  arrivals: Arrival[];
  lastUpdated: string;
  debug?: {
    rawCount: number;
    filteredCount: number;
    finalCount: number;
    isMockData: boolean;
  };
}

interface LiveArrivalsSectionProps {
  stationId: string;
  stationLines: string[];
}

// MTA line colors
const LINE_COLORS: Record<string, { bg: string; text: string }> = {
  '1': { bg: 'bg-red-600', text: 'text-white' },
  '2': { bg: 'bg-red-600', text: 'text-white' },
  '3': { bg: 'bg-red-600', text: 'text-white' },
  '4': { bg: 'bg-green-600', text: 'text-white' },
  '5': { bg: 'bg-green-600', text: 'text-white' },
  '6': { bg: 'bg-green-600', text: 'text-white' },
  '7': { bg: 'bg-purple-600', text: 'text-white' },
  'A': { bg: 'bg-blue-600', text: 'text-white' },
  'C': { bg: 'bg-blue-600', text: 'text-white' },
  'E': { bg: 'bg-blue-600', text: 'text-white' },
  'B': { bg: 'bg-orange-500', text: 'text-white' },
  'D': { bg: 'bg-orange-500', text: 'text-white' },
  'F': { bg: 'bg-orange-500', text: 'text-white' },
  'M': { bg: 'bg-orange-500', text: 'text-white' },
  'G': { bg: 'bg-lime-500', text: 'text-white' },
  'J': { bg: 'bg-amber-700', text: 'text-white' },
  'Z': { bg: 'bg-amber-700', text: 'text-white' },
  'L': { bg: 'bg-gray-500', text: 'text-white' },
  'N': { bg: 'bg-yellow-400', text: 'text-black' },
  'Q': { bg: 'bg-yellow-400', text: 'text-black' },
  'R': { bg: 'bg-yellow-400', text: 'text-black' },
  'W': { bg: 'bg-yellow-400', text: 'text-black' },
  'S': { bg: 'bg-gray-600', text: 'text-white' },
};

function getLineColors(line: string) {
  return LINE_COLORS[line] || { bg: 'bg-gray-500', text: 'text-white' };
}

export function LiveArrivalsSection({ stationId, stationLines }: LiveArrivalsSectionProps) {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const fetchArrivals = useCallback(async () => {
    try {
      const response = await fetch(`/api/arrivals/${stationId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch arrivals');
      }

      const data: ArrivalsResponse = await response.json();
      setArrivals(data.arrivals);
      setLastUpdated(new Date(data.lastUpdated));
      setIsMockData(data.debug?.isMockData || false);
      setError(null);
    } catch (err) {
      console.error('Error fetching arrivals:', err);
      setError('Unable to load arrival data');
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchArrivals();

    // Refresh every 30 seconds
    const interval = setInterval(fetchArrivals, 30000);

    return () => clearInterval(interval);
  }, [fetchArrivals]);

  // Group arrivals by direction
  const uptownArrivals = arrivals.filter(a =>
    a.direction === 'Uptown' || a.direction.includes('N')
  );
  const downtownArrivals = arrivals.filter(a =>
    a.direction === 'Downtown' || a.direction.includes('S')
  );

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
          <span className="text-3xl">🕐</span>
          &quot;LIVE&quot; ARRIVALS
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
          <span className="text-3xl">🕐</span>
          &quot;LIVE&quot; ARRIVALS
        </h2>
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
        <span className="text-3xl">🕐</span>
        &quot;LIVE&quot; ARRIVALS
        {isMockData && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
            Demo Data
          </span>
        )}
      </h2>

      {arrivals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No arrival information available at this time
        </div>
      ) : (
        <div className="space-y-6">
          {/* Uptown/Queens-bound */}
          {uptownArrivals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Uptown / Queens / Bronx
              </h3>
              <div className="space-y-3">
                {uptownArrivals.map((arrival, index) => (
                  <ArrivalRow key={`up-${arrival.line}-${index}`} arrival={arrival} />
                ))}
              </div>
            </div>
          )}

          {/* Downtown/Brooklyn-bound */}
          {downtownArrivals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Downtown / Brooklyn
              </h3>
              <div className="space-y-3">
                {downtownArrivals.map((arrival, index) => (
                  <ArrivalRow key={`down-${arrival.line}-${index}`} arrival={arrival} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>
          Updated every 30 seconds {lastUpdated && `• Last update: ${lastUpdated.toLocaleTimeString()}`}
        </span>
        <span>Data: MTA GTFS Real-time</span>
      </div>
    </section>
  );
}

function ArrivalRow({ arrival }: { arrival: Arrival }) {
  const colors = getLineColors(arrival.line);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded font-bold ${colors.bg} ${colors.text}`}>
          {arrival.line}
        </span>
        <div>
          <div className="font-semibold text-gray-900">
            {arrival.destination}
          </div>
          <div className="text-sm text-gray-500">
            {arrival.direction}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {arrival.minutesUntil === 0 ? 'Now' : `${arrival.minutesUntil} min`}
      </div>
    </div>
  );
}

export default LiveArrivalsSection;
