"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "../../../components/Navigation";
import SubwayBadge from "../../../components/SubwayBadge";
import CultureCard from "../../../components/CultureCard";
import AdSlot from "../../../components/AdSlot";

// Sample data for subway lines
const lineData = {
  "a": {
    id: "A",
    name: "A",
    color: "bg-blue-600",
    textColor: "text-white",
    fullName: "8th Avenue Express",
    description: "Express service between northern Manhattan and far Rockaway/Lefferts Boulevard in Queens and Brooklyn.",
    stations: [
      { name: "Inwood-207 St", borough: "Manhattan", transfers: [], slug: "inwood-207" },
      { name: "Dyckman St", borough: "Manhattan", transfers: [], slug: "dyckman" },
      { name: "190 St", borough: "Manhattan", transfers: [], slug: "190-st" },
      { name: "181 St", borough: "Manhattan", transfers: [], slug: "181-st" },
      { name: "175 St", borough: "Manhattan", transfers: [], slug: "175-st" },
      { name: "168 St", borough: "Manhattan", transfers: ["1"], slug: "168-st" },
      { name: "145 St", borough: "Manhattan", transfers: ["B", "C", "D"], slug: "145-st" },
      { name: "125 St", borough: "Manhattan", transfers: ["B", "C", "D"], slug: "125-st-bcd" },
      { name: "59 St-Columbus Circle", borough: "Manhattan", transfers: ["B", "C", "D", "1"], slug: "59-columbus-circle" },
      { name: "42 St-Port Authority", borough: "Manhattan", transfers: ["N", "Q", "R", "W", "1", "2", "3", "7"], slug: "42-port-authority" },
      { name: "34 St-Penn Station", borough: "Manhattan", transfers: ["1", "2", "3"], slug: "34-penn-station" },
      { name: "14 St", borough: "Manhattan", transfers: ["L"], slug: "14-st-8-ave" },
      { name: "W 4 St", borough: "Manhattan", transfers: ["B", "C", "D", "E", "F", "M"], slug: "w-4-st" },
      { name: "Spring St", borough: "Manhattan", transfers: ["C", "E"], slug: "spring-st" },
      { name: "Canal St", borough: "Manhattan", transfers: ["C", "E"], slug: "canal-st-8-ave" },
      { name: "Chambers St", borough: "Manhattan", transfers: ["C"], slug: "chambers-st" },
      { name: "Fulton St", borough: "Manhattan", transfers: ["2", "3", "4", "5", "J", "Z"], slug: "fulton-st" },
      { name: "High St", borough: "Brooklyn", transfers: [], slug: "high-st" },
      { name: "Jay St-MetroTech", borough: "Brooklyn", transfers: ["F", "R"], slug: "jay-st-metrotech" },
      { name: "Hoyt-Schermerhorn", borough: "Brooklyn", transfers: ["G"], slug: "hoyt-schermerhorn" },
    ],
    culturalSpots: [
      {
        category: "LANDMARK",
        title: "One World Trade Center",
        description: "The tallest building in NYC, accessible from Fulton St station",
        image: "🏢"
      },
      {
        category: "CULTURE",
        title: "Brooklyn Bridge Views", 
        description: "Walk across the iconic bridge from High St station",
        image: "🌉"
      },
      {
        category: "FOOD",
        title: "Smorgasburg Weekend Market",
        description: "Famous food market near Brooklyn Bridge-City Hall area",
        image: "🍕"
      }
    ]
  }
};

export default function LinePage() {
  const params = useParams();
  const lineId = params['line-id'] as string;
  const line = lineData[lineId as keyof typeof lineData];

  if (!line) {
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
                className={`absolute left-6 top-0 bottom-0 w-1 ${line.color}`}
                style={{height: `${line.stations.length * 60 - 20}px`}}
              ></div>
              
              {/* Station stops */}
              <div className="space-y-4">
                {line.stations.map((station, index) => (
                  <div key={index} className="flex items-center space-x-4 relative">
                    {/* Station dot */}
                    <div className={`w-4 h-4 rounded-full ${line.color} border-2 border-white relative z-10`}></div>
                    
                    {/* Station info */}
                    <div className="flex-1">
                      <Link 
                        href={`/station/${station.slug}`}
                        className="block hover:bg-gray-50 rounded p-2 -m-2 transition-colors"
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