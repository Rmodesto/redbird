"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SiteHeader from '@/components/site/SiteHeader';

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

const LABEL = "text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]";
const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23262626%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

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

function Stat({ value, label, accent, br, bb }: { value: string; label: string; accent?: boolean; br?: boolean; bb?: boolean }) {
  return (
    <div className={`flex flex-col gap-f5 p-f21 ${br ? 'border-r border-ripstop' : ''} ${bb ? 'border-b border-ripstop' : ''}`}>
      <span className={`text-[34px] font-bold leading-[42px] ${accent ? 'text-tag' : 'text-paper'}`}>{value}</span>
      <span className={`${LABEL} text-graphite`}>{label}</span>
    </div>
  );
}

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
    let filtered = [...stations];

    // Filter by borough
    if (selectedBorough !== "All") {
      filtered = filtered.filter(s => s.borough === selectedBorough);
    }

    // Filter by line
    if (selectedLine !== "All") {
      filtered = filtered.filter(s => s.lines.includes(selectedLine));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.borough.toLowerCase().includes(query)
      );
    }

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
    <div className="min-h-screen bg-jet font-sans text-paper">
      <SiteHeader active="stations" />

      {/* ── Masthead ─────────────────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f34 md:px-f55 md:pb-f55 md:pt-f55">
          <div className="flex flex-col gap-f34 lg:flex-row lg:items-end lg:justify-between lg:gap-f55">
            <div className="flex min-w-0 max-w-f610 flex-col gap-f21">
              <span className={`quoted ${LABEL} text-graphite`}>Stations</span>
              <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                All Stations
              </h1>
              <p className="m-0 text-[18px] leading-[29px] text-graphite [text-wrap:pretty]">
                Every stop in the system, searchable by borough and line. Open any station for
                real-time arrivals, accessibility and the sound of its platform.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 border border-ripstop">
              <Stat value="445" label="Stations" br bb />
              <Stat value="27" label="Lines" bb />
              <Stat value="4" label="Boroughs" br />
              <Stat value="3" label="Divisions" accent />
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-[8px]" style={{ backgroundImage: ZIGZAG, backgroundRepeat: "repeat-x" }} />

      {/* ── Filter bar ───────────────────────────────────────── */}
      <section className="border-b border-ripstop bg-suede">
        <div className="mx-auto max-w-[1440px] px-f21 py-f21 md:px-f55">
          <div className="flex flex-wrap items-center justify-between gap-f13">
            <div className="flex flex-wrap items-center gap-f13">
              {/* Borough Filter */}
              <label className="flex items-center gap-f8">
                <span className={`${LABEL} text-graphite`}>Borough</span>
                <select
                  value={selectedBorough}
                  onChange={(e) => setSelectedBorough(e.target.value)}
                  className={`${LABEL} rounded-seam border border-ripstop bg-jet px-f13 py-f8 text-paper focus:border-paper focus:outline-none`}
                >
                  {BOROUGHS.map(borough => (
                    <option key={borough} value={borough}>
                      {borough} ({boroughCounts[borough] || 0})
                    </option>
                  ))}
                </select>
              </label>

              {/* Line Filter */}
              <label className="flex items-center gap-f8">
                <span className={`${LABEL} text-graphite`}>Line</span>
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className={`${LABEL} rounded-seam border border-ripstop bg-jet px-f13 py-f8 text-paper focus:border-paper focus:outline-none`}
                >
                  {LINES.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </label>

              {/* Search */}
              <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-seam border border-ripstop bg-jet px-f13 py-f8 text-[14px] text-paper placeholder:text-muted focus:border-paper focus:outline-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-f5">
              {(["grid", "list"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`${LABEL} rounded-seam border px-f13 py-f8 ${
                    viewMode === m ? "border-paper bg-paper text-ink" : "border-ripstop text-graphite hover:text-paper"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className={`mt-f13 ${LABEL} text-graphite`}>
            Showing {filteredStations.length === 0 ? 0 : indexOfFirstStation + 1}&ndash;{Math.min(indexOfLastStation, filteredStations.length)} of {filteredStations.length} stations
          </div>
        </div>
      </section>

      {/* ── Stations Grid/List ───────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
        {currentStations.length === 0 ? (
          <div className="flex flex-col items-center gap-f8 py-f89 text-center">
            <span className={`${LABEL} text-graphite`}>No results</span>
            <p className="m-0 text-[18px] leading-[29px] text-graphite">No stations found matching your filters.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-f21 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentStations.map((station) => (
              <Link
                key={station.id}
                href={`/station/${station.slug}`}
                className="group flex flex-col gap-f13 border border-ripstop bg-suede p-f21 no-underline transition-colors hover:border-graphite"
              >
                <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">{station.name}</h3>
                <p className={`m-0 ${LABEL} text-graphite`}>{station.borough}</p>
                <div className="flex flex-wrap gap-f5">
                  {station.lines.map((lineId) => {
                    // For display, just show the base line number without "Express"
                    const displayLine = lineId.replace(' Express', '');
                    const colors = getLineColors(displayLine);
                    return (
                      <div
                        key={lineId}
                        className={`${colors.color} ${colors.textColor} flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold`}
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
          <div className="border border-ripstop">
            {currentStations.map((station) => (
              <Link
                key={station.id}
                href={`/station/${station.slug}`}
                className="flex items-center justify-between gap-f21 border-b border-ripstop bg-suede p-f21 no-underline transition-colors last:border-b-0 hover:bg-ripstop"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="m-0 text-[16px] font-bold leading-[21px] text-paper">{station.name}</h3>
                  <p className={`m-0 mt-[3px] ${LABEL} text-graphite`}>{station.borough}</p>
                </div>
                <div className="flex shrink-0 items-center gap-f5">
                  {station.lines.map((lineId) => {
                    // For display, just show the base line number without "Express"
                    const displayLine = lineId.replace(' Express', '');
                    const colors = getLineColors(displayLine);
                    return (
                      <div
                        key={lineId}
                        className={`${colors.color} ${colors.textColor} flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold`}
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
      </section>

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <section className="mx-auto max-w-[1440px] px-f21 pb-f89 md:px-f55">
          <div className="flex items-center justify-center gap-f8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${LABEL} rounded-seam border px-f13 py-f8 ${
                currentPage === 1
                  ? "cursor-not-allowed border-ripstop text-muted"
                  : "border-ripstop text-graphite hover:text-paper"
              }`}
            >
              Previous
            </button>

            {/* Page numbers */}
            <div className="hidden gap-f5 md:flex">
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
                    className={`${LABEL} flex h-10 w-10 items-center justify-center rounded-seam border ${
                      currentPage === pageNumber
                        ? "border-paper bg-paper text-ink"
                        : "border-ripstop text-graphite hover:text-paper"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <span className={`${LABEL} text-graphite md:hidden`}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${LABEL} rounded-seam border px-f13 py-f8 ${
                currentPage === totalPages
                  ? "cursor-not-allowed border-ripstop text-muted"
                  : "border-ripstop text-graphite hover:text-paper"
              }`}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
