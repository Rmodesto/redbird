import { StationDetailsCard } from "redbird";

const sidebar = { maxWidth: "23rem" } as const;

// Only the length of `platforms` is rendered, but the entries are shaped the
// way the station payload actually carries them.
const platform = (id: string, direction: string) => ({ id, direction });

/** Times Sq-42 St — the deepest Manhattan complex, nine lines, five platforms. */
export function UndergroundComplex() {
  return (
    <div style={sidebar}>
      <StationDetailsCard
        station={{
          borough: "Manhattan",
          lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "S"],
          platforms: [
            platform("127-N", "Uptown"),
            platform("127-S", "Downtown"),
            platform("725-E", "Queens-bound"),
            platform("R16-N", "Uptown"),
            platform("902-S", "Grand Central Shuttle"),
          ],
        }}
        amenities={{ stationType: "underground" }}
      />
    </div>
  );
}

/** Queensboro Plaza — the elevated 7/N/W transfer above Northern Blvd. */
export function ElevatedStation() {
  return (
    <div style={sidebar}>
      <StationDetailsCard
        station={{
          borough: "Queens",
          lines: ["7", "N", "W"],
          platforms: [platform("718-N", "Manhattan-bound"), platform("718-S", "Queens-bound")],
        }}
        amenities={{ stationType: "elevated" }}
      />
    </div>
  );
}

/** Broad Channel — at-grade on the Rockaway causeway, A and the Rockaway S. */
export function AtGradeStation() {
  return (
    <div style={sidebar}>
      <StationDetailsCard
        station={{
          borough: "Queens",
          lines: ["A", "S"],
          platforms: [platform("H04-N", "Manhattan-bound"), platform("H04-S", "Far Rockaway-bound")],
        }}
        amenities={{ stationType: "at-grade" }}
      />
    </div>
  );
}

/** All three station types together — the axis the card actually varies on. */
export function StationTypes() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1.5rem" }}>
      <StationDetailsCard
        station={{
          borough: "Brooklyn",
          lines: ["B", "D", "N", "Q", "R", "2", "3", "4", "5"],
          platforms: [
            platform("235-N", "Manhattan-bound"),
            platform("235-S", "Brooklyn-bound"),
            platform("R31-N", "Manhattan-bound"),
            platform("R31-S", "Coney Island-bound"),
          ],
        }}
        amenities={{ stationType: "underground" }}
      />
      <StationDetailsCard
        station={{
          borough: "Bronx",
          lines: ["2", "5"],
          platforms: [platform("222-N", "Wakefield-bound"), platform("222-S", "Manhattan-bound")],
        }}
        amenities={{ stationType: "elevated" }}
      />
      <StationDetailsCard
        station={{
          borough: "Staten Island",
          lines: ["SIR"],
          platforms: [platform("S31-N", "St George-bound")],
        }}
        amenities={{ stationType: "at-grade" }}
      />
    </div>
  );
}
