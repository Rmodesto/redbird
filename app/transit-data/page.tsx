"use client";

import { useState, useEffect } from "react";

interface StopTimeUpdate {
  stopId: string;
  arrival: number | null;
  departure: number | null;
}

interface TransitUpdate {
  tripId: string;
  routeId: string;
  startTime: string;
  startDate: string;
  stopTimeUpdates: StopTimeUpdate[];
}

const TransitUpdates = () => {
  const [updates, setUpdates] = useState<TransitUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransitData = async () => {
      try {
        const response = await fetch("/api/transit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TransitUpdate[] = await response.json();
        setUpdates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransitData();
    const interval = setInterval(fetchTransitData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4">Loading transit data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transit Updates</h2>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div
            key={`${update.tripId}-${index}`}
            className="border p-4 rounded-lg"
          >
            <h3 className="font-semibold">Route: {update.routeId}</h3>
            <p>Trip ID: {update.tripId}</p>
            <p>Start Time: {update.startTime}</p>
            <div className="mt-2">
              <h4 className="font-medium">Stops:</h4>
              <div className="ml-4">
                {update.stopTimeUpdates.map((stop, stopIndex) => (
                  <div key={`${stop.stopId}-${stopIndex}`} className="text-sm">
                    <p>Stop: {stop.stopId}</p>
                    {stop.arrival && (
                      <p>
                        Arrival:{" "}
                        {new Date(stop.arrival * 1000).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransitUpdates;
