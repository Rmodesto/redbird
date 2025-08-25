"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navigation from "../../../components/Navigation";
import SubwayBadge from "../../../components/SubwayBadge";
import ServiceAlert from "../../../components/ServiceAlert";
import CultureCard from "../../../components/CultureCard";
import AdSlot from "../../../components/AdSlot";

// MTA line color mapping
const getLineColors = (lineId: string) => {
  const colorMap: Record<string, {color: string, textColor: string}> = {
    '1': { color: 'bg-red-600', textColor: 'text-white' },
    '2': { color: 'bg-red-600', textColor: 'text-white' },
    '3': { color: 'bg-red-600', textColor: 'text-white' },
    '4': { color: 'bg-green-600', textColor: 'text-white' },
    '5': { color: 'bg-green-600', textColor: 'text-white' },
    '6': { color: 'bg-green-600', textColor: 'text-white' },
    '7': { color: 'bg-purple-600', textColor: 'text-white' },
    'A': { color: 'bg-blue-600', textColor: 'text-white' },
    'C': { color: 'bg-blue-600', textColor: 'text-white' },
    'E': { color: 'bg-blue-600', textColor: 'text-white' },
    'B': { color: 'bg-orange-500', textColor: 'text-white' },
    'D': { color: 'bg-orange-500', textColor: 'text-white' },
    'F': { color: 'bg-orange-500', textColor: 'text-white' },
    'M': { color: 'bg-orange-500', textColor: 'text-white' },
    'N': { color: 'bg-yellow-500', textColor: 'text-black' },
    'Q': { color: 'bg-yellow-500', textColor: 'text-black' },
    'R': { color: 'bg-yellow-500', textColor: 'text-black' },
    'W': { color: 'bg-yellow-500', textColor: 'text-black' },
    'G': { color: 'bg-green-500', textColor: 'text-white' },
    'J': { color: 'bg-amber-600', textColor: 'text-white' },
    'Z': { color: 'bg-amber-600', textColor: 'text-white' },
    'L': { color: 'bg-gray-500', textColor: 'text-white' },
    'S': { color: 'bg-gray-600', textColor: 'text-white' },
  };
  
  return colorMap[lineId] || { color: 'bg-gray-600', textColor: 'text-white' };
};

interface Station {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  borough: string;
  lines: string[];
  platforms: Array<{
    stopId: string;
    direction: string;
    lines: string[];
  }>;
  accessibility?: {
    elevator: boolean;
    escalator: boolean;
    wheelchair: boolean;
  };
  nearbyPlaces?: Array<{
    name: string;
    type: string;
    distance: number;
  }>;
}

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  arrivalTime: number;
  minutesUntil: number;
  stopId: string;
}

export default function StationPage() {
  const params = useParams();
  const stationSlug = params['station-slug'] as string;
  const [station, setStation] = useState<Station | null>(null);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch station data
  useEffect(() => {
    async function fetchStation() {
      try {
        setLoading(true);
        const response = await fetch(`/api/stations/${stationSlug}`);
        
        if (!response.ok) {
          throw new Error('Station not found');
        }
        
        const stationData = await response.json();
        setStation(stationData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load station');
      } finally {
        setLoading(false);
      }
    }

    fetchStation();
  }, [stationSlug]);

  // Fetch arrivals data
  useEffect(() => {
    if (!station) return;

    async function fetchArrivals() {
      try {
        setArrivalsLoading(true);
        const response = await fetch(`/api/arrivals/${station.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setArrivals(data.arrivals || []);
        } else {
          console.error('Failed to fetch arrivals');
          setArrivals([]);
        }
      } catch (err) {
        console.error('Error fetching arrivals:', err);
        setArrivals([]);
      } finally {
        setArrivalsLoading(false);
      }
    }

    fetchArrivals();
    
    // Refresh arrivals every 30 seconds
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, [station]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading station...</p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Station Not Found</h1>
          <p className="text-gray-600">{error || 'The station you're looking for doesn't exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-gray-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{station.name}</h1>
              <p className="text-xl text-gray-300">{station.borough}</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              {station.accessibility?.wheelchair && <span className="text-2xl">♿</span>}
              {station.accessibility?.elevator && <span className="text-2xl">🛗</span>}
              {station.accessibility?.escalator && <span className="text-2xl">🚶</span>}
              <span className="text-2xl">🚻</span>
              <span className="text-2xl">🛜</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm font-medium">LINES SERVED:</span>
            {station.lines.map((lineId) => {
              const colors = getLineColors(lineId);
              return (
                <SubwayBadge 
                  key={lineId} 
                  line={{
                    id: lineId,
                    name: lineId,
                    color: colors.color,
                    textColor: colors.textColor
                  }} 
                  size="sm" 
                />
              );
            })}
          </div>
          
          <ServiceAlert type="good_service" message="GOOD SERVICE ON ALL LINES" />
        </div>
      </section>

      {/* Real-Time Arrivals */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">REAL-TIME ARRIVALS</h2>
          
          {arrivalsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading arrivals...</p>
            </div>
          ) : arrivals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No upcoming trains in the next 30 minutes</p>
              <p className="text-sm text-gray-500 mt-2">Check back soon for updates</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {arrivals.map((arrival, index) => {
                const colors = getLineColors(arrival.line);
                return (
                  <div key={index} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm border">
                    <div className="flex items-center space-x-4">
                      <SubwayBadge 
                        line={{
                          id: arrival.line,
                          name: arrival.line,
                          color: colors.color,
                          textColor: colors.textColor
                        }} 
                        size="sm" 
                        clickable={false}
                      />
                      <div>
                        <p className="font-medium">{arrival.destination}</p>
                        <p className="text-sm text-gray-600">{arrival.direction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        arrival.minutesUntil <= 1 ? 'text-red-600' : 
                        arrival.minutesUntil <= 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {arrival.minutesUntil <= 1 ? 'Now' : `${arrival.minutesUntil}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {arrival.minutesUntil <= 1 ? '' : 'min'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <AdSlot size="leaderboard" />
        </div>
      </section>

      {/* Nearby Places */}
      {station.nearbyPlaces && station.nearbyPlaces.length > 0 && (
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">NEARBY PLACES</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {station.nearbyPlaces.map((place, index) => {
                const typeIcons: Record<string, string> = {
                  'food': '🍕',
                  'services': '🏦',
                  'shopping': '🛍️',
                  'entertainment': '🎭',
                  'transport': '🚌',
                  'default': '📍'
                };
                
                return (
                  <div key={index} className="bg-white rounded-lg p-4 text-center border hover:shadow-md transition-shadow">
                    <span className="text-3xl mb-2 block">{typeIcons[place.type] || typeIcons.default}</span>
                    <h3 className="font-medium text-sm mb-1">{place.name}</h3>
                    <p className="text-xs text-gray-600">{place.distance.toFixed(1)} mi</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Cultural Notes - Coming Soon */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">CULTURAL NOTES</h2>
          <div className="bg-white rounded-lg p-6 border text-center">
            <span className="text-4xl mb-4 block">🎨</span>
            <h3 className="text-xl font-bold mb-2">Coming Soon!</h3>
            <p className="text-gray-600">
              We're collecting fascinating stories, art installations, and cultural insights about this station.
              Check back soon for historical notes and local discoveries.
            </p>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <AdSlot size="banner" />
        </div>
      </section>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🏠</span>
            HOME
          </button>
          <button className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🚇</span>
            LINES
          </button>
          <button className="flex flex-col items-center py-2 text-xs font-medium text-black">
            <span className="text-lg mb-1">📍</span>
            STATIONS
          </button>
          <button className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🗺️</span>
            MAP
          </button>
          <button className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🎨</span>
            CULTURE
          </button>
        </div>
      </div>
    </div>
  );
}