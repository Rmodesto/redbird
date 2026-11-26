"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SiteHeader from '@/components/site/SiteHeader';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';

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

// Editorial pill, on white. Matches the reference control style:
// active = jet fill / white text, inactive = white fill / ink text, ink border.
const PILL_BASE =
  "inline-flex h-[34px] items-center px-f13 text-[11px] font-bold uppercase leading-none tracking-[.08em] border border-ink no-underline transition-colors";
const pill = (active: boolean) =>
  `${PILL_BASE} ${active ? "bg-jet text-paper" : "bg-paper text-ink hover:bg-[#FAFAFA]"}`;

function groupIdFor(letter: string) {
  return letter === "#" ? "stations-num" : `stations-${letter}`;
}

interface StationsClientProps {
  initialStations: Station[];
}

export default function StationsClient({ initialStations }: StationsClientProps) {
  const [stations] = useState<Station[]>(initialStations);
  const [filteredStations, setFilteredStations] = useState<Station[]>(initialStations);
  const [selectedBorough, setSelectedBorough] = useState("All");
  const [selectedLine, setSelectedLine] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
  }, [stations, selectedBorough, selectedLine, searchQuery]);

  // Group filtered stations A–Z (numbers collapse into a leading "#" group).
  const groups = useMemo(() => {
    const by: Record<string, Station[]> = {};
    const sorted = [...filteredStations].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
    sorted.forEach((s) => {
      const first = (s.name.trim().charAt(0) || "#").toUpperCase();
      const key = /[A-Z]/.test(first) ? first : "#";
      (by[key] = by[key] || []).push(s);
    });
    return Object.keys(by)
      .sort((a, b) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)))
      .map((letter) => ({ letter, items: by[letter] }));
  }, [filteredStations]);

  const presentLetters = useMemo(() => new Set(groups.map((g) => g.letter)), [groups]);
  const jumpLetters = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader active="stations" />

      {/* ── Dark grid masthead ───────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-f34 px-f21 py-f55 md:px-f55 md:py-f89 lg:grid-cols-golden lg:gap-f89">
          <div className="flex min-w-0 flex-col gap-f21">
            <span className={`quoted ${LABEL} text-graphite`}>Station</span>
            <h1 className="m-0 text-[clamp(40px,8vw,68px)] font-bold uppercase leading-[1.02] tracking-[-.02em] text-paper">
              NYC Subway Stations
            </h1>
            <p className="m-0 max-w-[440px] text-[18px] leading-[29px] text-paper [text-wrap:pretty]">
              All {stations.length} stations, A to Z. Search by name, filter by borough and line,
              and open any stop for live arrivals and the sound of its platform.
            </p>
          </div>

          {/* Right column — search, mirroring the reference masthead */}
          <label className="flex h-[55px] items-center gap-f13 border border-ripstop bg-suede px-f21">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8A8A8A" strokeWidth="1.6" aria-hidden="true">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l4 4" />
            </svg>
            <input
              aria-label="Search stations"
              type="text"
              placeholder={`Search ${stations.length} stations`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-[16px] text-paper outline-none placeholder:text-graphite"
            />
          </label>
        </div>
      </section>

      {/* ── White paper body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-f21 pb-f34 md:px-f55 md:pb-f89">
        <main className="flex flex-col gap-f34 bg-paper p-f21 [outline:1px_dashed_#CFCFCF] [outline-offset:-8px] md:p-f89">

          {/* Filter controls */}
          <div className="flex flex-col gap-f13 border-b border-ink pb-f21">
            <div className="flex flex-wrap gap-f8">
              {BOROUGHS.map((borough) => (
                <button
                  key={borough}
                  onClick={() => setSelectedBorough(borough)}
                  className={pill(selectedBorough === borough)}
                >
                  {borough}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-f8">
              <span className={`${LABEL} mr-f5 text-muted`}>Line</span>
              {LINES.map((line) => (
                <button
                  key={line}
                  onClick={() => setSelectedLine(line)}
                  className={pill(selectedLine === line)}
                >
                  {line}
                </button>
              ))}
              <span className="flex-1" />
              <span className="text-[13px] font-bold uppercase tracking-[.08em] tabular-nums text-muted">
                {filteredStations.length} Stations
              </span>
            </div>
          </div>

          {/* A–Z jump nav */}
          <nav aria-label="Jump to letter" className="flex flex-wrap gap-[3px]">
            {jumpLetters.map((ch) => {
              const active = presentLetters.has(ch);
              return active ? (
                <a
                  key={ch}
                  href={`#${groupIdFor(ch)}`}
                  className="flex h-[34px] w-[34px] items-center justify-center border border-seam text-[13px] font-bold text-ink no-underline transition-colors hover:bg-[#FAFAFA]"
                >
                  {ch}
                </a>
              ) : (
                <span
                  key={ch}
                  aria-hidden="true"
                  className="flex h-[34px] w-[34px] items-center justify-center border border-seam text-[13px] font-bold text-[#CFCFCF]"
                >
                  {ch}
                </span>
              );
            })}
          </nav>

          {/* Station list, grouped A–Z */}
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-f8 py-f89 text-center">
              <span className={`${LABEL} text-muted`}>No results</span>
              <p className="m-0 text-[18px] leading-[29px] text-muted">
                No stations found matching your filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-f34">
              {groups.map((g) => (
                <section
                  key={g.letter}
                  id={groupIdFor(g.letter)}
                  className="grid scroll-mt-f21 grid-cols-1 gap-f8 md:grid-cols-[89px_minmax(0,1fr)] md:gap-f34"
                >
                  <span className="text-[34px] font-bold leading-none md:text-[55px]">{g.letter}</span>
                  <div className="border-t border-ink">
                    {g.items.map((station) => (
                      <Link
                        key={station.id}
                        href={`/station/${station.slug}`}
                        className="flex items-center justify-between gap-f21 border-b border-seam py-f21 no-underline text-ink transition-colors hover:bg-[#FAFAFA]"
                      >
                        <span className="flex min-w-0 flex-col gap-[3px]">
                          <span className="text-[21px] font-bold leading-[26px]">{station.name}</span>
                          <span className="text-[13px] leading-[21px] text-muted">{station.borough}</span>
                        </span>
                        <SubwayLinesBadges lines={station.lines} size="sm" className="shrink-0 justify-end" />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
