"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';

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
  { id: "1", name: "1", color: "bg-red-600", textColor: "text-white", fullName: "Broadway-7th Avenue Local", description: "Local service between Van Cortlandt Park and South Ferry", boroughs: ["Manhattan", "Bronx"], stationCount: 38, terminals: ["Van Cortlandt Park-242 St", "South Ferry"], serviceType: "Local" },
  { id: "2", name: "2", color: "bg-red-600", textColor: "text-white", fullName: "7th Avenue Express", description: "Express service between Wakefield and Flatbush Avenue", boroughs: ["Manhattan", "Bronx", "Brooklyn"], stationCount: 52, terminals: ["Wakefield-241 St", "Flatbush Av-Brooklyn College"], serviceType: "Express" },
  { id: "3", name: "3", color: "bg-red-600", textColor: "text-white", fullName: "7th Avenue Express", description: "Express service between Harlem and New Lots Avenue", boroughs: ["Manhattan", "Brooklyn"], stationCount: 34, terminals: ["Harlem-148 St", "New Lots Av"], serviceType: "Express" },
  // IRT Lexington Avenue Line
  { id: "4", name: "4", color: "bg-green-600", textColor: "text-white", fullName: "Lexington Avenue Express", description: "Express service between Woodlawn and Crown Heights", boroughs: ["Manhattan", "Bronx", "Brooklyn"], stationCount: 45, terminals: ["Woodlawn", "Crown Heights-Utica Av"], serviceType: "Express" },
  { id: "5", name: "5", color: "bg-green-600", textColor: "text-white", fullName: "Lexington Avenue Express", description: "Express service between Eastchester and Flatbush Avenue", boroughs: ["Manhattan", "Bronx", "Brooklyn"], stationCount: 42, terminals: ["Eastchester-Dyre Av", "Flatbush Av-Brooklyn College"], serviceType: "Express" },
  { id: "6", name: "6", color: "bg-green-600", textColor: "text-white", fullName: "Lexington Avenue Local", description: "Local service between Pelham Bay Park and Brooklyn Bridge", boroughs: ["Manhattan", "Bronx"], stationCount: 38, terminals: ["Pelham Bay Park", "Brooklyn Bridge-City Hall"], serviceType: "Local/Express" },
  // IRT Flushing Line
  { id: "7", name: "7", color: "bg-purple-600", textColor: "text-white", fullName: "Flushing Express/Local", description: "Service between Times Square and Flushing-Main Street", boroughs: ["Manhattan", "Queens"], stationCount: 22, terminals: ["Times Square-42 St", "Flushing-Main St"], serviceType: "Express/Local" },
  // IND 8th Avenue Line
  { id: "A", name: "A", color: "bg-blue-600", textColor: "text-white", fullName: "8th Avenue Express", description: "Express service to Far Rockaway and Lefferts Boulevard", boroughs: ["Manhattan", "Brooklyn", "Queens"], stationCount: 44, terminals: ["Inwood-207 St", "Far Rockaway/Lefferts Blvd"], serviceType: "Express" },
  { id: "C", name: "C", color: "bg-blue-600", textColor: "text-white", fullName: "8th Avenue Local", description: "Local service between 168 Street and Euclid Avenue", boroughs: ["Manhattan", "Brooklyn"], stationCount: 40, terminals: ["168 St", "Euclid Av"], serviceType: "Local" },
  { id: "E", name: "E", color: "bg-blue-600", textColor: "text-white", fullName: "8th Avenue Local", description: "Local service to Jamaica Center and World Trade Center", boroughs: ["Manhattan", "Queens"], stationCount: 24, terminals: ["Jamaica Center", "World Trade Center"], serviceType: "Express/Local" },
  // IND 6th Avenue Line
  { id: "B", name: "B", color: "bg-orange-500", textColor: "text-white", fullName: "6th Avenue Express", description: "Weekday express service between Bedford Park and Brighton Beach", boroughs: ["Manhattan", "Bronx", "Brooklyn"], stationCount: 36, terminals: ["Bedford Park Blvd", "Brighton Beach"], serviceType: "Express" },
  { id: "D", name: "D", color: "bg-orange-500", textColor: "text-white", fullName: "6th Avenue Express", description: "Express service between Norwood and Coney Island", boroughs: ["Manhattan", "Bronx", "Brooklyn"], stationCount: 45, terminals: ["Norwood-205 St", "Coney Island-Stillwell Av"], serviceType: "Express" },
  { id: "F", name: "F", color: "bg-orange-500", textColor: "text-white", fullName: "6th Avenue Local", description: "Local service between Jamaica and Coney Island", boroughs: ["Manhattan", "Queens", "Brooklyn"], stationCount: 45, terminals: ["Jamaica-179 St", "Coney Island-Stillwell Av"], serviceType: "Local/Express" },
  { id: "M", name: "M", color: "bg-orange-500", textColor: "text-white", fullName: "6th Avenue Local", description: "Local service between Middle Village and Financial District", boroughs: ["Manhattan", "Brooklyn", "Queens"], stationCount: 36, terminals: ["Middle Village-Metropolitan Av", "Essex St"], serviceType: "Local" },
  // BMT Broadway Line
  { id: "N", name: "N", color: "bg-yellow-500", textColor: "text-black", fullName: "Broadway Express", description: "Express service between Astoria and Coney Island", boroughs: ["Manhattan", "Queens", "Brooklyn"], stationCount: 45, terminals: ["Astoria-Ditmars Blvd", "Coney Island-Stillwell Av"], serviceType: "Express" },
  { id: "Q", name: "Q", color: "bg-yellow-500", textColor: "text-black", fullName: "Broadway Express", description: "Express service between 96 Street and Coney Island", boroughs: ["Manhattan", "Brooklyn"], stationCount: 29, terminals: ["96 St", "Coney Island-Stillwell Av"], serviceType: "Express" },
  { id: "R", name: "R", color: "bg-yellow-500", textColor: "text-black", fullName: "Broadway Local", description: "Local service between Forest Hills and Bay Ridge", boroughs: ["Manhattan", "Queens", "Brooklyn"], stationCount: 45, terminals: ["Forest Hills-71 Av", "Bay Ridge-95 St"], serviceType: "Local" },
  { id: "W", name: "W", color: "bg-yellow-500", textColor: "text-black", fullName: "Broadway Local", description: "Weekday service between Astoria and Whitehall Street", boroughs: ["Manhattan", "Queens"], stationCount: 21, terminals: ["Astoria-Ditmars Blvd", "Whitehall St"], serviceType: "Local" },
  // IND Crosstown Line
  { id: "G", name: "G", color: "bg-green-500", textColor: "text-white", fullName: "Brooklyn-Queens Crosstown", description: "Local service between Court Square and Church Avenue", boroughs: ["Brooklyn", "Queens"], stationCount: 21, terminals: ["Court Sq", "Church Av"], serviceType: "Local" },
  // BMT Nassau Street Line
  { id: "J", name: "J", color: "bg-amber-600", textColor: "text-white", fullName: "Nassau Street Local", description: "Local service between Jamaica Center and Broad Street", boroughs: ["Manhattan", "Brooklyn", "Queens"], stationCount: 30, terminals: ["Jamaica Center", "Broad St"], serviceType: "Local/Express" },
  { id: "Z", name: "Z", color: "bg-amber-600", textColor: "text-white", fullName: "Nassau Street Express", description: "Rush hour express service", boroughs: ["Manhattan", "Brooklyn", "Queens"], stationCount: 25, terminals: ["Jamaica Center", "Broad St"], serviceType: "Express" },
  // BMT Canarsie Line
  { id: "L", name: "L", color: "bg-gray-500", textColor: "text-white", fullName: "14th Street-Canarsie", description: "Local service between 8 Avenue and Canarsie", boroughs: ["Manhattan", "Brooklyn"], stationCount: 24, terminals: ["8 Av", "Canarsie-Rockaway Pkwy"], serviceType: "Local" },
  // Shuttles
  { id: "S", name: "S", color: "bg-gray-600", textColor: "text-white", fullName: "42nd Street Shuttle", description: "Shuttle service between Times Square and Grand Central", boroughs: ["Manhattan"], stationCount: 3, terminals: ["Times Square", "Grand Central"], serviceType: "Shuttle" },
];

// Trunk groups. `swatch` carries the official MTA trunk colour used by the
// filter-button chip (also the bullet colour in SubwayLinesBadges).
const lineGroups = [
  { name: "IRT Broadway-7th Avenue", lines: ["1", "2", "3"], swatch: "#EE352E" },
  { name: "IRT Lexington Avenue", lines: ["4", "5", "6"], swatch: "#00933C" },
  { name: "IRT Flushing", lines: ["7"], swatch: "#B933AD" },
  { name: "IND 8th Avenue", lines: ["A", "C", "E"], swatch: "#0039A6" },
  { name: "IND 6th Avenue", lines: ["B", "D", "F", "M"], swatch: "#FF6319" },
  { name: "BMT Broadway", lines: ["N", "Q", "R", "W"], swatch: "#FCCC0A" },
  { name: "IND Crosstown", lines: ["G"], swatch: "#6CBE45" },
  { name: "BMT Nassau Street", lines: ["J", "Z"], swatch: "#996633" },
  { name: "BMT Canarsie", lines: ["L"], swatch: "#A7A9AC" },
  { name: "Shuttles", lines: ["S"], swatch: "#808183" },
];

// id → trunk name, for the per-row eyebrow.
const trunkForLine: Record<string, string> = {};
lineGroups.forEach((g) => g.lines.forEach((id) => (trunkForLine[id] = g.name)));

const allLines = ["1", "2", "3", "4", "5", "6", "7", "A", "C", "E", "B", "D", "F", "M", "G", "J", "Z", "L", "N", "Q", "R", "W", "S"];

const EYEBROW = "text-[11px] font-bold uppercase leading-[16px] tracking-[.08em]";

export default function LinesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filteredLines = selectedGroup
    ? subwayLinesData.filter((line) => lineGroups.find((g) => g.name === selectedGroup)?.lines.includes(line.id))
    : subwayLinesData;

  return (
    <div className="min-h-screen bg-jet font-sans text-paper">
      <SiteHeader active="lines" />

      {/* ── Dark grid masthead ───────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] box-border px-f21 py-f34 md:px-f55 md:py-f89">
          <div className="grid grid-cols-1 items-end gap-f34 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:gap-f89">
            <div className="flex flex-col gap-f21">
              <span className={`quoted text-[13px] font-bold uppercase leading-[21px] tracking-[.08em] text-graphite`}>Line</span>
              <h1 className="m-0 text-[clamp(40px,8vw,68px)] font-bold uppercase leading-[1] tracking-[-.02em] text-paper">
                Subway lines
              </h1>
              <p className="m-0 max-w-[440px] text-[18px] leading-[29px] text-paper [text-wrap:pretty]">
                Every route in the system. Pick a line to see its stops, the cars that run it,
                and every recording we&apos;ve made along it.
              </p>
            </div>

            <div className="lg:justify-self-end">
              <SubwayLinesBadges lines={allLines} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* ── White paper body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] box-border px-f21 pb-f34 md:px-f55 md:pb-f89">
        <main className="panel flex flex-col gap-f34 bg-paper p-f21 text-ink md:gap-f55 md:p-f89">

          {/* Filter row */}
          <div className="flex flex-wrap items-end justify-between gap-f34 border-b border-ink pb-f21">
            <div className="flex flex-wrap gap-f8">
              <button
                onClick={() => setSelectedGroup(null)}
                className={`flex h-[34px] items-center gap-f8 border border-ink px-f13 ${EYEBROW} transition-colors ${
                  !selectedGroup ? "bg-jet text-paper" : "bg-paper text-ink"
                }`}
              >
                <span aria-hidden className="h-[8px] w-[8px] shrink-0" style={{ background: "#111111" }} />
                All lines
              </button>
              {lineGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={`flex h-[34px] items-center gap-f8 border border-ink px-f13 ${EYEBROW} transition-colors ${
                    selectedGroup === group.name ? "bg-jet text-paper" : "bg-paper text-ink"
                  }`}
                >
                  <span aria-hidden className="h-[8px] w-[8px] shrink-0" style={{ background: group.swatch }} />
                  {group.name}
                </button>
              ))}
            </div>
            <span className="text-[13px] font-bold uppercase tracking-[.08em] text-muted">
              {filteredLines.length} {filteredLines.length === 1 ? "line" : "lines"}
            </span>
          </div>

          {/* Line list */}
          <div className="border-t border-ink">
            {filteredLines.map((line) => (
              <Link
                key={line.id}
                href={`/line/${line.id.toLowerCase()}`}
                className="flex flex-col gap-f13 border-b border-seam py-f34 no-underline text-ink transition-colors hover:bg-[#FAFAFA] md:grid md:grid-cols-[89px_minmax(0,1.618fr)_minmax(0,1fr)_144px] md:items-center md:gap-f34"
              >
                <div className="shrink-0">
                  <SubwayLinesBadges lines={[line.id]} size="lg" />
                </div>

                <span className="flex flex-col gap-f8">
                  <span className={`${EYEBROW} text-muted`}>
                    {trunkForLine[line.id]} · {line.serviceType}
                  </span>
                  <span className="text-[26px] font-bold leading-[34px]">{line.fullName}</span>
                  <span className="text-[13px] leading-[21px] text-muted">
                    {line.terminals.join(" ↔ ")}
                  </span>
                </span>

                <span className="flex flex-col gap-f3 text-[13px] leading-[21px] text-muted">
                  <span>
                    <b className="font-bold tabular-nums text-ink">{line.stationCount}</b> stations
                  </span>
                  <span>{line.boroughs.join(", ")}</span>
                </span>

                <span className="flex flex-col gap-f3 md:items-end">
                  <span className={`${EYEBROW} text-muted`}>Recordings →</span>
                </span>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
