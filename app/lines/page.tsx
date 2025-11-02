"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import AdSlot from "../../components/AdSlot";

interface LineInfo {
  id: string;
  name: string;
  color: string;
  textColor: string;
  fullName: string;
  description: string;
  boroughs: string[];
  stationCount: number;
  terminals: string[];
  serviceType: string;
}

const subwayLinesData: LineInfo[] = [
  // IRT Broadway-7th Avenue Line
  {
    id: "1",
    name: "1",
    color: "bg-red-600",
    textColor: "text-white",
    fullName: "Broadway-7th Avenue Local",
    description: "Local service between Van Cortlandt Park and South Ferry",
    boroughs: ["Manhattan", "Bronx"],
    stationCount: 38,
    terminals: ["Van Cortlandt Park-242 St", "South Ferry"],
    serviceType: "Local"
  },
  {
    id: "2",
    name: "2",
    color: "bg-red-600",
    textColor: "text-white",
    fullName: "7th Avenue Express",
    description: "Express service between Wakefield and Flatbush Avenue",
    boroughs: ["Manhattan", "Bronx", "Brooklyn"],
    stationCount: 52,
    terminals: ["Wakefield-241 St", "Flatbush Av-Brooklyn College"],
    serviceType: "Express"
  },
  {
    id: "3",
    name: "3",
    color: "bg-red-600",
    textColor: "text-white",
    fullName: "7th Avenue Express",
    description: "Express service between Harlem and New Lots Avenue",
    boroughs: ["Manhattan", "Brooklyn"],
    stationCount: 34,
    terminals: ["Harlem-148 St", "New Lots Av"],
    serviceType: "Express"
  },
  
  // IRT Lexington Avenue Line
  {
    id: "4",
    name: "4",
    color: "bg-green-600",
    textColor: "text-white",
    fullName: "Lexington Avenue Express",
    description: "Express service between Woodlawn and Crown Heights",
    boroughs: ["Manhattan", "Bronx", "Brooklyn"],
    stationCount: 45,
    terminals: ["Woodlawn", "Crown Heights-Utica Av"],
    serviceType: "Express"
  },
  {
    id: "5",
    name: "5",
    color: "bg-green-600",
    textColor: "text-white",
    fullName: "Lexington Avenue Express",
    description: "Express service between Eastchester and Flatbush Avenue",
    boroughs: ["Manhattan", "Bronx", "Brooklyn"],
    stationCount: 42,
    terminals: ["Eastchester-Dyre Av", "Flatbush Av-Brooklyn College"],
    serviceType: "Express"
  },
  {
    id: "6",
    name: "6",
    color: "bg-green-600",
    textColor: "text-white",
    fullName: "Lexington Avenue Local",
    description: "Local service between Pelham Bay Park and Brooklyn Bridge",
    boroughs: ["Manhattan", "Bronx"],
    stationCount: 38,
    terminals: ["Pelham Bay Park", "Brooklyn Bridge-City Hall"],
    serviceType: "Local/Express"
  },
  
  // IRT Flushing Line
  {
    id: "7",
    name: "7",
    color: "bg-purple-600",
    textColor: "text-white",
    fullName: "Flushing Express/Local",
    description: "Service between Times Square and Flushing-Main Street",
    boroughs: ["Manhattan", "Queens"],
    stationCount: 22,
    terminals: ["Times Square-42 St", "Flushing-Main St"],
    serviceType: "Express/Local"
  },
  
  // IND 8th Avenue Line
  {
    id: "A",
    name: "A",
    color: "bg-blue-600",
    textColor: "text-white",
    fullName: "8th Avenue Express",
    description: "Express service to Far Rockaway and Lefferts Boulevard",
    boroughs: ["Manhattan", "Brooklyn", "Queens"],
    stationCount: 44,
    terminals: ["Inwood-207 St", "Far Rockaway/Lefferts Blvd"],
    serviceType: "Express"
  },
  {
    id: "C",
    name: "C",
    color: "bg-blue-600",
    textColor: "text-white",
    fullName: "8th Avenue Local",
    description: "Local service between 168 Street and Euclid Avenue",
    boroughs: ["Manhattan", "Brooklyn"],
    stationCount: 40,
    terminals: ["168 St", "Euclid Av"],
    serviceType: "Local"
  },
  {
    id: "E",
    name: "E",
    color: "bg-blue-600",
    textColor: "text-white",
    fullName: "8th Avenue Local",
    description: "Local service to Jamaica Center and World Trade Center",
    boroughs: ["Manhattan", "Queens"],
    stationCount: 24,
    terminals: ["Jamaica Center", "World Trade Center"],
    serviceType: "Express/Local"
  },
  
  // IND 6th Avenue Line
  {
    id: "B",
    name: "B",
    color: "bg-orange-500",
    textColor: "text-white",
    fullName: "6th Avenue Express",
    description: "Weekday express service between Bedford Park and Brighton Beach",
    boroughs: ["Manhattan", "Bronx", "Brooklyn"],
    stationCount: 36,
    terminals: ["Bedford Park Blvd", "Brighton Beach"],
    serviceType: "Express"
  },
  {
    id: "D",
    name: "D",
    color: "bg-orange-500",
    textColor: "text-white",
    fullName: "6th Avenue Express",
    description: "Express service between Norwood and Coney Island",
    boroughs: ["Manhattan", "Bronx", "Brooklyn"],
    stationCount: 45,
    terminals: ["Norwood-205 St", "Coney Island-Stillwell Av"],
    serviceType: "Express"
  },
  {
    id: "F",
    name: "F",
    color: "bg-orange-500",
    textColor: "text-white",
    fullName: "6th Avenue Local",
    description: "Local service between Jamaica and Coney Island",
    boroughs: ["Manhattan", "Queens", "Brooklyn"],
    stationCount: 45,
    terminals: ["Jamaica-179 St", "Coney Island-Stillwell Av"],
    serviceType: "Local/Express"
  },
  {
    id: "M",
    name: "M",
    color: "bg-orange-500",
    textColor: "text-white",
    fullName: "6th Avenue Local",
    description: "Local service between Middle Village and Financial District",
    boroughs: ["Manhattan", "Brooklyn", "Queens"],
    stationCount: 36,
    terminals: ["Middle Village-Metropolitan Av", "Essex St"],
    serviceType: "Local"
  },
  
  // BMT Broadway Line
  {
    id: "N",
    name: "N",
    color: "bg-yellow-500",
    textColor: "text-black",
    fullName: "Broadway Express",
    description: "Express service between Astoria and Coney Island",
    boroughs: ["Manhattan", "Queens", "Brooklyn"],
    stationCount: 45,
    terminals: ["Astoria-Ditmars Blvd", "Coney Island-Stillwell Av"],
    serviceType: "Express"
  },
  {
    id: "Q",
    name: "Q",
    color: "bg-yellow-500",
    textColor: "text-black",
    fullName: "Broadway Express",
    description: "Express service between 96 Street and Coney Island",
    boroughs: ["Manhattan", "Brooklyn"],
    stationCount: 29,
    terminals: ["96 St", "Coney Island-Stillwell Av"],
    serviceType: "Express"
  },
  {
    id: "R",
    name: "R",
    color: "bg-yellow-500",
    textColor: "text-black",
    fullName: "Broadway Local",
    description: "Local service between Forest Hills and Bay Ridge",
    boroughs: ["Manhattan", "Queens", "Brooklyn"],
    stationCount: 45,
    terminals: ["Forest Hills-71 Av", "Bay Ridge-95 St"],
    serviceType: "Local"
  },
  {
    id: "W",
    name: "W",
    color: "bg-yellow-500",
    textColor: "text-black",
    fullName: "Broadway Local",
    description: "Weekday service between Astoria and Whitehall Street",
    boroughs: ["Manhattan", "Queens"],
    stationCount: 21,
    terminals: ["Astoria-Ditmars Blvd", "Whitehall St"],
    serviceType: "Local"
  },
  
  // IND Crosstown Line
  {
    id: "G",
    name: "G",
    color: "bg-green-500",
    textColor: "text-white",
    fullName: "Brooklyn-Queens Crosstown",
    description: "Local service between Court Square and Church Avenue",
    boroughs: ["Brooklyn", "Queens"],
    stationCount: 21,
    terminals: ["Court Sq", "Church Av"],
    serviceType: "Local"
  },
  
  // BMT Nassau Street Line
  {
    id: "J",
    name: "J",
    color: "bg-amber-600",
    textColor: "text-white",
    fullName: "Nassau Street Local",
    description: "Local service between Jamaica Center and Broad Street",
    boroughs: ["Manhattan", "Brooklyn", "Queens"],
    stationCount: 30,
    terminals: ["Jamaica Center", "Broad St"],
    serviceType: "Local/Express"
  },
  {
    id: "Z",
    name: "Z",
    color: "bg-amber-600",
    textColor: "text-white",
    fullName: "Nassau Street Express",
    description: "Rush hour express service",
    boroughs: ["Manhattan", "Brooklyn", "Queens"],
    stationCount: 25,
    terminals: ["Jamaica Center", "Broad St"],
    serviceType: "Express"
  },
  
  // BMT Canarsie Line
  {
    id: "L",
    name: "L",
    color: "bg-gray-500",
    textColor: "text-white",
    fullName: "14th Street-Canarsie",
    description: "Local service between 8 Avenue and Canarsie",
    boroughs: ["Manhattan", "Brooklyn"],
    stationCount: 24,
    terminals: ["8 Av", "Canarsie-Rockaway Pkwy"],
    serviceType: "Local"
  },
  
  // Shuttles
  {
    id: "S",
    name: "S",
    color: "bg-gray-600",
    textColor: "text-white",
    fullName: "42nd Street Shuttle",
    description: "Shuttle service between Times Square and Grand Central",
    boroughs: ["Manhattan"],
    stationCount: 3,
    terminals: ["Times Square", "Grand Central"],
    serviceType: "Shuttle"
  }
];

// Group lines by their service
const lineGroups = [
  {
    name: "IRT Broadway-7th Avenue",
    lines: ["1", "2", "3"],
    color: "border-red-600"
  },
  {
    name: "IRT Lexington Avenue",
    lines: ["4", "5", "6"],
    color: "border-green-600"
  },
  {
    name: "IRT Flushing",
    lines: ["7"],
    color: "border-purple-600"
  },
  {
    name: "IND 8th Avenue",
    lines: ["A", "C", "E"],
    color: "border-blue-600"
  },
  {
    name: "IND 6th Avenue",
    lines: ["B", "D", "F", "M"],
    color: "border-orange-500"
  },
  {
    name: "BMT Broadway",
    lines: ["N", "Q", "R", "W"],
    color: "border-yellow-500"
  },
  {
    name: "IND Crosstown",
    lines: ["G"],
    color: "border-green-500"
  },
  {
    name: "BMT Nassau Street",
    lines: ["J", "Z"],
    color: "border-amber-600"
  },
  {
    name: "BMT Canarsie",
    lines: ["L"],
    color: "border-gray-500"
  },
  {
    name: "Shuttles",
    lines: ["S"],
    color: "border-gray-600"
  }
];

export default function LinesPage() {
  // Console log all subway lines overview
  console.log('🚇 NYC SUBWAY LINES OVERVIEW');
  console.log(`📊 Total Lines: ${subwayLinesData.length}`);
  console.log('🗺️ All Lines:');
  subwayLinesData.forEach((line, index) => {
    console.log(`  ${index + 1}. Line ${line.name} - ${line.fullName}`);
    console.log(`      📍 Stations: ${line.stationCount} | 🏘️ Boroughs: ${line.boroughs.join(', ')}`);
    console.log(`      🚉 Terminals: ${line.terminals.join(' ↔ ')}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredLines = selectedGroup
    ? subwayLinesData.filter(line => 
        lineGroups.find(g => g.name === selectedGroup)?.lines.includes(line.id)
      )
    : subwayLinesData;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SUBWAY LINES</h1>
          <p className="text-xl text-gray-300">
            Explore NYC's {subwayLinesData.length} subway lines across the city
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-gray-50 border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGroup(null)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  !selectedGroup ? "bg-black text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Lines
              </button>
              {lineGroups.map(group => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors border-l-4 ${group.color} ${
                    selectedGroup === group.name 
                      ? "bg-black text-white" 
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <AdSlot size="leaderboard" />
        </div>
      </section>

      {/* Lines Grid/List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/line/${line.id.toLowerCase()}`}
                  className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className={`h-2 ${line.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${line.color} ${line.textColor} w-16 h-16 rounded-lg text-3xl font-bold flex items-center justify-center`}>
                        {line.name}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        line.serviceType === "Express" ? "bg-red-100 text-red-700" :
                        line.serviceType === "Local" ? "bg-blue-100 text-blue-700" :
                        line.serviceType === "Express/Local" ? "bg-purple-100 text-purple-700" :
                        line.serviceType === "Local/Express" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {line.serviceType}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{line.fullName}</h3>
                    <p className="text-sm text-gray-600 mb-4">{line.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">📍</span>
                        <span className="flex-1">{line.boroughs.join(", ")}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">🚉</span>
                        <span className="flex-1">{line.stationCount} stations</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 mr-2">↔️</span>
                        <span className="flex-1 text-xs">{line.terminals.join(" ↔ ")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border divide-y">
              {filteredLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/line/${line.id.toLowerCase()}`}
                  className="flex items-center p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className={`${line.color} ${line.textColor} w-12 h-12 rounded text-xl font-bold flex items-center justify-center mr-4`}>
                    {line.name}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold">{line.fullName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        line.serviceType === "Express" ? "bg-red-100 text-red-700" :
                        line.serviceType === "Local" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {line.serviceType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{line.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>📍 {line.boroughs.join(", ")}</span>
                      <span>🚉 {line.stationCount} stations</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">QUICK FACTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-black mb-2">472</div>
              <div className="text-sm text-gray-600">Total Stations</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-black mb-2">27</div>
              <div className="text-sm text-gray-600">Subway Lines</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-black mb-2">245</div>
              <div className="text-sm text-gray-600">Miles of Track</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-black mb-2">5.5M</div>
              <div className="text-sm text-gray-600">Daily Riders</div>
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
          <Link href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-black">
            <span className="text-lg mb-1">🚇</span>
            LINES
          </Link>
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