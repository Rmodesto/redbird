"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "../../../components/Navigation";
import SubwayBadge from "../../../components/SubwayBadge";
import CultureCard from "../../../components/CultureCard";
import AdSlot from "../../../components/AdSlot";
import { getLineRoute, type LineRoute } from "../../../lib/map/subwayLineRoutes";

// Helper function to format station names
const formatStationName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => {
      // Handle special cases
      if (word === 'st') return 'St';
      if (word === 'av') return 'Ave';
      if (word === 'ave') return 'Ave';
      if (word === 'blvd') return 'Blvd';
      if (word === 'pkwy') return 'Pkwy';
      if (word === 'sq') return 'Sq';
      if (word === 'pl') return 'Pl';
      if (word === 'rd') return 'Rd';
      if (word === 'hts') return 'Heights';
      if (word === 'jfk') return 'JFK';
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Helper function to determine borough from station slug
const getBoroughFromStation = (slug: string): string => {
  // This is a simplified mapping - in production, you'd use actual station data
  if (slug.includes('bronx') || slug.includes('woodlawn') || slug.includes('pelham') || 
      slug.includes('fordham') || slug.includes('138') || slug.includes('149') || 
      slug.includes('161') || slug.includes('167') || slug.includes('170') || 
      slug.includes('176') || slug.includes('183')) {
    return 'Bronx';
  }
  if (slug.includes('queens') || slug.includes('jamaica') || slug.includes('flushing') || 
      slug.includes('astoria') || slug.includes('forest') || slug.includes('jackson') ||
      slug.includes('corona') || slug.includes('elmhurst') || slug.includes('woodside')) {
    return 'Queens';
  }
  if (slug.includes('brooklyn') || slug.includes('atlantic') || slug.includes('jay') || 
      slug.includes('hoyt') || slug.includes('nevins') || slug.includes('bergen') ||
      slug.includes('prospect') || slug.includes('coney') || slug.includes('brighton')) {
    return 'Brooklyn';
  }
  if (slug.includes('staten')) {
    return 'Staten Island';
  }
  // Default to Manhattan for most stations
  return 'Manhattan';
};

// Map line colors
const lineColors: Record<string, { bg: string; text: string }> = {
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
  'G': { bg: 'bg-green-500', text: 'text-white' },
  'J': { bg: 'bg-amber-600', text: 'text-white' },
  'Z': { bg: 'bg-amber-600', text: 'text-white' },
  'L': { bg: 'bg-gray-500', text: 'text-white' },
  'N': { bg: 'bg-yellow-500', text: 'text-black' },
  'Q': { bg: 'bg-yellow-500', text: 'text-black' },
  'R': { bg: 'bg-yellow-500', text: 'text-black' },
  'W': { bg: 'bg-yellow-500', text: 'text-black' },
  'S': { bg: 'bg-gray-600', text: 'text-white' },
};

export default function LinePage() {
  const params = useParams();
  const lineId = (params['line-id'] as string).toUpperCase();
  const [lineRoute, setLineRoute] = useState<LineRoute | null>(null);
  const [loading, setLoading] = useState(true);

  // Load line data asynchronously
  useEffect(() => {
    const loadLineData = async () => {
      try {
        const route = await getLineRoute(lineId);
        setLineRoute(route || null);
      } catch (error) {
        console.error('Error loading line data:', error);
        setLineRoute(null);
      } finally {
        setLoading(false);
      }
    };

    loadLineData();
  }, [lineId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Loading subway line information...</p>
        </div>
      </div>
    );
  }

  if (!lineRoute) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Line Not Found</h1>
          <p className="text-gray-600">The subway line you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Transform line route data to match component structure
  const line = {
    id: lineRoute.id,
    name: lineRoute.id,
    color: lineColors[lineRoute.id]?.bg || 'bg-gray-600',
    textColor: lineColors[lineRoute.id]?.text || 'text-white',
    fullName: lineRoute.name.split(' - ')[1] || lineRoute.name,
    description: `Service from ${formatStationName(lineRoute.terminals.north || lineRoute.terminals.west || '')} to ${formatStationName(lineRoute.terminals.south || lineRoute.terminals.east || '')}`,
    stations: lineRoute.stations.map(slug => ({
      name: formatStationName(slug),
      borough: getBoroughFromStation(slug),
      transfers: [], // We don't have transfer data in the route file
      slug: slug
    })),
    culturalSpots: [
      {
        category: "LANDMARK",
        title: "Explore NYC",
        description: `Discover landmarks along the ${lineRoute.id} line`,
        image: "🏢"
      },
      {
        category: "CULTURE",
        title: "Local Culture", 
        description: `Experience the neighborhoods of the ${lineRoute.id} train`,
        image: "🎭"
      },
      {
        category: "FOOD",
        title: "Food & Dining",
        description: `Find great eats near ${lineRoute.id} train stations`,
        image: "🍕"
      }
    ]
  };

  // Console log all stops for this line
  console.log(`🚇 LINE ${line.name.toUpperCase()} - ${line.fullName}`);
  console.log(`📊 Total Stops: ${line.stations.length}`);
  console.log(`🗺️ All Stops:`);
  line.stations.forEach((station, index) => {
    console.log(`  ${index + 1}. ${station.name} (${station.borough})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-12" style={{background: `linear-gradient(135deg, ${line.color.includes('blue') ? '#1e40af' : line.color.includes('red') ? '#dc2626' : line.color.includes('green') ? '#16a34a' : '#000'} 0%, #374151 100%)`}}>
        <div className="max-w-4xl mx-auto px-4 text-white">
          <div className="flex items-center space-x-6 mb-6">
            <SubwayBadge line={line} size="lg" clickable={false} />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{line.fullName}</h1>
              <p className="text-xl text-gray-200">{line.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Route Map Visualization */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">ROUTE MAP</h2>
          <div className="bg-white rounded-lg p-6 border">
            <div className="relative">
              {/* Vertical line representing the route */}
              <div 
                className={`absolute left-6 top-2 w-1 ${line.color}`}
                style={{height: `calc(100% - 16px)`}}
              ></div>
              
              {/* Station stops */}
              <div className="space-y-4 relative">
                {line.stations.map((station, index) => (
                  <div key={index} className="flex items-center space-x-4 relative">
                    {/* Station dot */}
                    <div className={`w-4 h-4 rounded-full ${line.color} border-2 border-white relative z-10`}></div>
                    
                    {/* Station info */}
                    <div className="flex-1">
                      <Link 
                        href={`/station/${station.slug}`}
                        className="block hover:bg-gray-50/50 rounded-r p-2 pl-4 -my-2 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{station.name}</h3>
                            <p className="text-sm text-gray-600">{station.borough}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {station.transfers.map((transfer, tIndex) => (
                              <div 
                                key={tIndex}
                                className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                                  transfer === '1' || transfer === '2' || transfer === '3' ? 'bg-red-600 text-white' :
                                  transfer === '4' || transfer === '5' || transfer === '6' ? 'bg-green-600 text-white' :
                                  transfer === '7' ? 'bg-purple-600 text-white' :
                                  transfer === 'N' || transfer === 'Q' || transfer === 'R' || transfer === 'W' ? 'bg-yellow-500 text-black' :
                                  transfer === 'B' || transfer === 'D' || transfer === 'F' || transfer === 'M' ? 'bg-orange-500 text-white' :
                                  transfer === 'A' || transfer === 'C' || transfer === 'E' ? 'bg-blue-600 text-white' :
                                  transfer === 'G' ? 'bg-green-500 text-white' :
                                  transfer === 'J' || transfer === 'Z' ? 'bg-amber-600 text-white' :
                                  transfer === 'L' ? 'bg-gray-500 text-white' :
                                  'bg-gray-600 text-white'
                                }`}
                              >
                                {transfer}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4">
          <AdSlot size="leaderboard" />
        </div>
      </section>

      {/* Things to Do Along This Line */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">THINGS TO DO ALONG THE {line.name} LINE</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {line.culturalSpots.map((spot, index) => (
              <CultureCard
                key={index}
                category={spot.category}
                title={spot.title}
                description={spot.description}
                image={spot.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Service Information */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">SERVICE INFORMATION</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-xl font-bold mb-4">🕒 HOURS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Weekdays:</span>
                  <span className="font-medium">24/7 Service</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekends:</span>
                  <span className="font-medium">24/7 Service</span>
                </div>
                <div className="flex justify-between">
                  <span>Late Night:</span>
                  <span className="font-medium">Local Service Only</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-xl font-bold mb-4">⚡ EXPRESS STOPS</h3>
              <div className="text-sm space-y-1">
                <p>• 145 St</p>
                <p>• 125 St</p>
                <p>• 59 St-Columbus Circle</p>
                <p>• 42 St-Port Authority</p>
                <p>• 14 St</p>
                <p>• W 4 St</p>
                <p>• Fulton St</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🏠</span>
            HOME
          </Link>
          <button className="flex flex-col items-center py-2 text-xs font-medium text-black">
            <span className="text-lg mb-1">🚇</span>
            LINES
          </button>
          <Link href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">📍</span>
            STATIONS
          </Link>
          <Link href="/map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🗺️</span>
            MAP
          </Link>
          <Link href="/culture" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🎨</span>
            CULTURE
          </Link>
        </div>
      </div>
    </div>
  );
}