'use client';

import { useTrainArrivals } from '@/hooks/useMTAData';
import { SubwayLinesBadges } from '@/components/subway/SubwayLinesBadges';

interface TrainArrivalsProps {
  stationId: string;
  stationName: string;
}

export default function TrainArrivals({ stationId, stationName }: TrainArrivalsProps) {
  const { arrivals, alerts, loading, error, refresh } = useTrainArrivals(stationId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🚇 Live Train Arrivals</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🚇 Live Train Arrivals</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Unable to load arrival times</p>
          <button 
            onClick={refresh}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const uptown = arrivals.filter(a => a.direction === 'N');
  const downtown = arrivals.filter(a => a.direction === 'S');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">🚇 Live Train Arrivals</h2>
        <button
          onClick={refresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Service Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start">
                <span className="text-yellow-700 mr-2">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800">{alert.header}</h4>
                  <p className="text-sm text-yellow-700 mt-1">{alert.description}</p>
                  <div className="mt-2">
                    <SubwayLinesBadges lines={alert.lines} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Arrival Times */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Uptown/Queens */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">⬆️</span>
            Uptown / Queens
          </h3>
          <div className="space-y-2">
            {uptown.length > 0 ? (
              uptown.slice(0, 5).map((arrival, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SubwayLinesBadges lines={[arrival.line]} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {arrival.destinationStation}
                        </p>
                        {arrival.isDelayed && (
                          <span className="text-xs text-red-600">Delayed</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {arrival.minutesAway === 0 ? 'Now' : `${arrival.minutesAway} min`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No upcoming trains</p>
            )}
          </div>
        </div>

        {/* Downtown/Brooklyn */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">⬇️</span>
            Downtown / Brooklyn
          </h3>
          <div className="space-y-2">
            {downtown.length > 0 ? (
              downtown.slice(0, 5).map((arrival, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SubwayLinesBadges lines={[arrival.line]} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {arrival.destinationStation}
                        </p>
                        {arrival.isDelayed && (
                          <span className="text-xs text-red-600">Delayed</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {arrival.minutesAway === 0 ? 'Now' : `${arrival.minutesAway} min`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No upcoming trains</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Updated every 30 seconds • Last update: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}