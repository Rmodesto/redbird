"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Station {
  id: string;
  name: string;
  slug: string;
  borough: string;
  lines: string[];
}

interface StationSearchProps {
  placeholder?: string;
  className?: string;
}

export default function StationSearch({ 
  placeholder = "SEARCH STATIONS...", 
  className = "px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
}: StationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchStations = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/stations?search=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.stations || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchStations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleStationClick = (station: Station) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/station/${station.slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleStationClick(results[0]);
    }
  };

  const getLineColors = (lineId: string) => {
    const colorMap: Record<string, string> = {
      '1': 'bg-red-600', '2': 'bg-red-600', '3': 'bg-red-600',
      '4': 'bg-green-600', '5': 'bg-green-600', '6': 'bg-green-600',
      '7': 'bg-purple-600',
      'A': 'bg-blue-600', 'C': 'bg-blue-600', 'E': 'bg-blue-600',
      'B': 'bg-orange-500', 'D': 'bg-orange-500', 'F': 'bg-orange-500', 'M': 'bg-orange-500',
      'N': 'bg-yellow-500', 'Q': 'bg-yellow-500', 'R': 'bg-yellow-500', 'W': 'bg-yellow-500',
      'G': 'bg-green-500', 'J': 'bg-amber-600', 'Z': 'bg-amber-600',
      'L': 'bg-gray-500', 'S': 'bg-gray-600'
    };
    return colorMap[lineId] || 'bg-gray-600';
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={placeholder}
          className={className}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              No stations found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleStationClick(station)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{station.name}</div>
                      <div className="text-sm text-gray-600">{station.borough}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {station.lines.slice(0, 4).map((line) => (
                        <div
                          key={line}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center text-white ${getLineColors(line)}`}
                        >
                          {line}
                        </div>
                      ))}
                      {station.lines.length > 4 && (
                        <span className="text-xs text-gray-500">+{station.lines.length - 4}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}