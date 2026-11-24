import { AmenitiesCard } from "redbird";

// The station page renders this card in the right-hand sidebar column, so the
// previews frame it at a sidebar width rather than full bleed.
const sidebar = { maxWidth: "23rem" } as const;

/**
 * Jackson Hts-Roosevelt Av — a rebuilt transfer complex where almost
 * everything is present. Exercises the ✓ row styling.
 */
export function WellEquippedStation() {
  return (
    <div style={sidebar}>
      <AmenitiesCard
        amenities={{
          ada: true,
          elevators: true,
          restrooms: true,
          policePresence: true,
          wifi: true,
          yearBuilt: 1933,
        }}
      />
    </div>
  );
}

/**
 * 1 Av (L) — a narrow 1924 local stop with no elevator and no ADA path.
 * Exercises the ✗ row styling against the same layout.
 */
export function LegacyLocalStation() {
  return (
    <div style={sidebar}>
      <AmenitiesCard
        amenities={{
          ada: false,
          elevators: false,
          restrooms: false,
          policePresence: false,
          wifi: true,
          yearBuilt: 1924,
        }}
      />
    </div>
  );
}

/**
 * Two stations side by side — the comparison a rider actually makes, and the
 * only framing where the green/red availability axis reads at a glance.
 */
export function AvailabilityComparison() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "1.5rem" }}>
      <AmenitiesCard
        amenities={{
          ada: true,
          elevators: true,
          restrooms: false,
          policePresence: true,
          wifi: true,
          yearBuilt: 1904,
        }}
      />
      <AmenitiesCard
        amenities={{
          ada: false,
          elevators: false,
          restrooms: false,
          policePresence: true,
          wifi: true,
          yearBuilt: 1918,
        }}
      />
    </div>
  );
}
