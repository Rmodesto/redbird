"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import AdSlot from "../../components/AdSlot";

interface Station {
  id: string;
  name: string;
  slug: string;
  borough: string;
  lines: string[];
  latitude: number;
  longitude: number;
}

const BOROUGHS = ["All", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const LINES = ["All", "1", "2", "3", "4", "5", "6", "7", "A", "B", "C", "D", "E", "F", "G", "J", "L", "M", "N", "Q", "R", "S", "W", "Z"];

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

interface StationsClientProps {
  initialStations: Station[];
}

export default function StationsClient({ initialStations }: StationsClientProps) {
  const [stations] = useState<Station[]>(initialStations);
  const [filteredStations, setFilteredStations] = useState<Station[]>(initialStations);
  const [selectedBorough, setSelectedBorough] = useState("All");
  const [selectedLine, setSelectedLine] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const stationsPerPage = 24;

  useEffect(() => {
    console.log('Filtering stations...', { 
      stationsCount: stations.length, 
      selectedBorough, 
      selectedLine, 
      searchQuery 
    });
    
    let filtered = [...stations];
    console.log('Starting with', filtered.length, 'stations');

    // Filter by borough
    if (selectedBorough !== "All") {
      filtered = filtered.filter(s => s.borough === selectedBorough);
      console.log('After borough filter:', filtered.length, 'stations');
    }

    // Filter by line
    if (selectedLine !== "All") {
      filtered = filtered.filter(s => s.lines.includes(selectedLine));
      console.log('After line filter:', filtered.length, 'stations');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.borough.toLowerCase().includes(query)
      );
      console.log('After search filter:', filtered.length, 'stations');
    }

    console.log('Setting filtered stations:', filtered.length);
    setFilteredStations(filtered);
    setCurrentPage(1);
  }, [stations, selectedBorough, selectedLine, searchQuery]);

  // Pagination
  const indexOfLastStation = currentPage * stationsPerPage;
  const indexOfFirstStation = indexOfLastStation - stationsPerPage;
  const currentStations = filteredStations.slice(indexOfFirstStation, indexOfLastStation);
  const totalPages = Math.ceil(filteredStations.length / stationsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Count stations by borough
  const boroughCounts = BOROUGHS.reduce((acc, borough) => {
    if (borough === "All") {
      acc[borough] = stations.length;
    } else {
      acc[borough] = stations.filter(s => s.borough === borough).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ALL STATIONS</h1>
          <p className="text-xl text-gray-300">
            Explore all {stations.length} subway stations across NYC's five boroughs
          </p>
          {/* Debug info */}
          <div className="text-sm text-gray-400 mt-2">
            Debug: Stations={stations.length}, Filtered={filteredStations.length}, Server-side loaded ✅
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-gray-50 border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Borough Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Borough:</label>
                <select
                  value={selectedBorough}
                  onChange={(e) => setSelectedBorough(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {BOROUGHS.map(borough => (
                    <option key={borough} value={borough}>
                      {borough} ({boroughCounts[borough] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Line:</label>
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {LINES.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
                title="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
                title="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {indexOfFirstStation + 1}-{Math.min(indexOfLastStation, filteredStations.length)} of {filteredStations.length} stations
          </div>
        </div>
      </section>

      {/* Ad Slot */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <AdSlot size="leaderboard" />
        </div>
      </section>

      {/* Stations Grid/List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {currentStations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600">No stations found matching your filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentStations.map((station) => (
                <Link
                  key={station.id}
                  href={`/station/${station.slug}`}
                  className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6"
                >
                  <h3 className="text-xl font-bold mb-2">{station.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{station.borough}</p>
                  <div className="flex flex-wrap gap-1">
                    {station.lines.map((lineId) => {
                      // For display, just show the base line number without "Express"
                      const displayLine = lineId.replace(' Express', '');
                      const colors = getLineColors(displayLine);
                      return (
                        <div
                          key={lineId}
                          className={`${colors.color} ${colors.textColor} w-8 h-8 rounded text-xs font-bold flex items-center justify-center`}
                        >
                          {displayLine}
                        </div>
                      );
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border divide-y">
              {currentStations.map((station) => (
                <Link
                  key={station.id}
                  href={`/station/${station.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{station.name}</h3>
                    <p className="text-sm text-gray-600">{station.borough}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {station.lines.map((lineId) => {
                      // For display, just show the base line number without "Express"
                      const displayLine = lineId.replace(' Express', '');
                      const colors = getLineColors(displayLine);
                      return (
                        <div
                          key={lineId}
                          className={`${colors.color} ${colors.textColor} w-6 h-6 rounded text-xs font-bold flex items-center justify-center`}
                        >
                          {displayLine}
                        </div>
                      );
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="py-8 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="hidden md:flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-10 h-10 rounded ${
                        currentPage === pageNumber 
                          ? "bg-black text-white" 
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <span className="md:hidden text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🏠</span>
            HOME
          </Link>
          <Link href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
            <span className="text-lg mb-1">🚇</span>
            LINES
          </Link>
          <Link href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-black">
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