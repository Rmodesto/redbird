import { LiveArrivalsCard } from "redbird";

// Fixed timestamp: the card prints lastUpdated.toLocaleTimeString(), so a
// literal Date keeps captures byte-stable between syncs.
const UPDATED = new Date("2026-03-14T09:41:00Z");

/** Times Sq-42 St — the full board a transfer complex produces. */
export function TransferComplexBoard() {
  return (
    <div style={{ maxWidth: "36rem" }}>
      <LiveArrivalsCard
        arrivals={{
          lastUpdated: UPDATED,
          dataSource: "MTA GTFS-RT",
          arrivals: [
            { line: "1", direction: "downtown", destination: "South Ferry", minutesAway: 1, platform: "1" },
            { line: "2", direction: "uptown", destination: "Wakefield-241 St", minutesAway: 3, platform: "3" },
            { line: "N", direction: "downtown", destination: "Coney Island-Stillwell Av", minutesAway: 4 },
            { line: "Q", direction: "uptown", destination: "96 St-2 Av", minutesAway: 7, platform: "2" },
            { line: "7", direction: "east", destination: "Flushing-Main St", minutesAway: 12 },
          ],
        }}
      />
    </div>
  );
}

/** 14 St-Union Sq, L platform only — a single-line crosstown stop. */
export function SingleLinePlatform() {
  return (
    <div style={{ maxWidth: "36rem" }}>
      <LiveArrivalsCard
        arrivals={{
          lastUpdated: UPDATED,
          dataSource: "MTA GTFS-RT",
          arrivals: [
            { line: "L", direction: "east", destination: "Canarsie-Rockaway Pkwy", minutesAway: 0, platform: "Brooklyn-bound" },
            { line: "L", direction: "west", destination: "8 Av", minutesAway: 5, platform: "Manhattan-bound" },
            { line: "L", direction: "east", destination: "Canarsie-Rockaway Pkwy", minutesAway: 9, platform: "Brooklyn-bound" },
          ],
        }}
      />
    </div>
  );
}

/** Broad Channel overnight — the feed returns nothing; the empty state shows. */
export function NoArrivals() {
  return (
    <div style={{ maxWidth: "36rem" }}>
      <LiveArrivalsCard
        arrivals={{
          lastUpdated: UPDATED,
          dataSource: "MTA GTFS-RT",
          arrivals: [],
        }}
      />
    </div>
  );
}
