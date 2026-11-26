"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from '@/components/site/SiteHeader';

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

const lineGroups = [
  { name: "IRT Broadway-7th Avenue", lines: ["1", "2", "3"], color: "border-red-600" },
  { name: "IRT Lexington Avenue", lines: ["4", "5", "6"], color: "border-green-600" },
  { name: "IRT Flushing", lines: ["7"], color: "border-purple-600" },
  { name: "IND 8th Avenue", lines: ["A", "C", "E"], color: "border-blue-600" },
  { name: "IND 6th Avenue", lines: ["B", "D", "F", "M"], color: "border-orange-500" },
  { name: "BMT Broadway", lines: ["N", "Q", "R", "W"], color: "border-yellow-500" },
  { name: "IND Crosstown", lines: ["G"], color: "border-green-500" },
  { name: "BMT Nassau Street", lines: ["J", "Z"], color: "border-amber-600" },
  { name: "BMT Canarsie", lines: ["L"], color: "border-gray-500" },
  { name: "Shuttles", lines: ["S"], color: "border-gray-600" },
];

const LABEL = "text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]";
const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23262626%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

function FactCell({ value, label, accent, br, bb }: { value: string; label: string; accent?: boolean; br?: boolean; bb?: boolean }) {
  return (
    <div className={`flex flex-col gap-f5 p-f21 ${br ? 'border-r border-ripstop' : ''} ${bb ? 'border-b border-ripstop' : ''}`}>
      <span className={`text-[34px] font-bold leading-[42px] ${accent ? 'text-tag' : 'text-paper'}`}>{value}</span>
      <span className={`${LABEL} text-graphite`}>{label}</span>
    </div>
  );
}

export default function LinesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredLines = selectedGroup
    ? subwayLinesData.filter((line) => lineGroups.find((g) => g.name === selectedGroup)?.lines.includes(line.id))
    : subwayLinesData;

  return (
    <div className="min-h-screen bg-jet font-sans text-paper">
      <SiteHeader active="lines" />

      {/* ── Masthead ─────────────────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f34 md:px-f55 md:pb-f55 md:pt-f55">
          <div className="flex flex-col gap-f34 lg:flex-row lg:items-end lg:justify-between lg:gap-f55">
            <div className="flex min-w-0 max-w-f610 flex-col gap-f21">
              <span className={`quoted ${LABEL} text-graphite`}>Lines</span>
              <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                Subway Lines
              </h1>
              <p className="m-0 text-[18px] leading-[29px] text-graphite [text-wrap:pretty]">
                Every service in the system, grouped by trunk line. Open any line for its stations,
                real-time arrivals and the sounds recorded along it.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 border border-ripstop">
              <FactCell value="445" label="Stations" br bb />
              <FactCell value="27" label="Lines" bb />
              <FactCell value="4" label="Boroughs" br />
              <FactCell value="3" label="Divisions" accent />
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-[8px]" style={{ backgroundImage: ZIGZAG, backgroundRepeat: "repeat-x" }} />

      {/* ── Filter bar ───────────────────────────────────────── */}
      <section className="border-b border-ripstop bg-suede">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-f13 px-f21 py-f21 md:px-f55">
          <div className="flex flex-wrap gap-f8">
            <button
              onClick={() => setSelectedGroup(null)}
              className={`${LABEL} rounded-seam border px-f13 py-f8 transition-colors ${
                !selectedGroup ? "border-paper bg-paper text-ink" : "border-ripstop bg-jet text-graphite hover:text-paper"
              }`}
            >
              All Lines
            </button>
            {lineGroups.map((group) => (
              <button
                key={group.name}
                onClick={() => setSelectedGroup(group.name)}
                className={`${LABEL} rounded-seam border border-l-4 px-f13 py-f8 transition-colors ${group.color} ${
                  selectedGroup === group.name ? "bg-paper text-ink" : "bg-jet text-graphite hover:text-paper"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

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
      </section>

      {/* ── Lines ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-f21 md:grid-cols-2 lg:grid-cols-3">
            {filteredLines.map((line) => (
              <Link
                key={line.id}
                href={`/line/${line.id.toLowerCase()}`}
                className="group flex flex-col border border-ripstop bg-suede no-underline transition-colors hover:border-graphite"
              >
                <div className={`h-[8px] ${line.color}`} />
                <div className="flex flex-col gap-f13 p-f21">
                  <div className="flex items-center justify-between">
                    <span className={`${line.color} ${line.textColor} flex h-[55px] w-[55px] items-center justify-center rounded-full text-[26px] font-bold`}>
                      {line.name}
                    </span>
                    <span className={`${LABEL} text-graphite`}>{line.serviceType}</span>
                  </div>
                  <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">{line.fullName}</h3>
                  <p className="m-0 text-[14px] leading-[21px] text-graphite">{line.description}</p>
                  <div className="flex flex-col gap-f5 text-[13px] leading-[21px] text-graphite">
                    <span>{line.boroughs.join(" · ")}</span>
                    <span>{line.stationCount} stations</span>
                    <span className="text-muted">{line.terminals.join(" ↔ ")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-ripstop">
            {filteredLines.map((line) => (
              <Link
                key={line.id}
                href={`/line/${line.id.toLowerCase()}`}
                className="flex items-center gap-f21 border-b border-ripstop bg-suede p-f21 no-underline transition-colors last:border-b-0 hover:bg-ripstop"
              >
                <span className={`${line.color} ${line.textColor} flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[21px] font-bold`}>
                  {line.name}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-f13">
                    <h3 className="m-0 text-[16px] font-bold leading-[21px] text-paper">{line.fullName}</h3>
                    <span className={`${LABEL} shrink-0 text-graphite`}>{line.serviceType}</span>
                  </div>
                  <p className="m-0 mt-[3px] text-[13px] leading-[21px] text-graphite">{line.description}</p>
                  <div className="mt-[5px] flex flex-wrap gap-f13 text-[13px] text-muted">
                    <span>{line.boroughs.join(" · ")}</span>
                    <span>{line.stationCount} stations</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
