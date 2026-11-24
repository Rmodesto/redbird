import { CrimeStatsCard } from "redbird";

const sidebar = { maxWidth: "23rem" } as const;

/**
 * 125 St (4/5/6) — a busy uptown complex with a heavy incident count.
 * Note: the component hard-codes the success colour on all three figures, so
 * these numbers render in the same reassuring green as a quiet station's.
 */
export function HighIncidentStation() {
  return (
    <div style={sidebar}>
      <CrimeStatsCard
        crimeStats={{
          felonies: 147,
          misdemeanors: 312,
          violations: 88,
          year: 2025,
          radius: 0.25,
        }}
      />
    </div>
  );
}

/** Broad Channel (A/S) — an outer-Queens stop with almost no reported crime. */
export function QuietOuterStation() {
  return (
    <div style={sidebar}>
      <CrimeStatsCard
        crimeStats={{
          felonies: 2,
          misdemeanors: 6,
          violations: 1,
          year: 2025,
          radius: 0.5,
        }}
      />
    </div>
  );
}

/**
 * Times Sq-42 St next to Atlantic Av-Barclays Ctr. Side by side, the colour
 * treatment is identical despite an order-of-magnitude difference in counts.
 */
export function SeverityComparison() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "1.5rem" }}>
      <CrimeStatsCard
        crimeStats={{ felonies: 203, misdemeanors: 486, violations: 131, year: 2025, radius: 0.25 }}
      />
      <CrimeStatsCard
        crimeStats={{ felonies: 41, misdemeanors: 97, violations: 24, year: 2025, radius: 0.25 }}
      />
    </div>
  );
}
