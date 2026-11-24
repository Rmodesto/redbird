import { SubwayLinesBadges } from "redbird";

const ALL_LINES = [
  "1", "2", "3", "4", "5", "6", "7",
  "A", "C", "E", "B", "D", "F", "M",
  "G", "J", "Z", "L", "N", "Q", "R", "W", "S",
];

/**
 * variant="default" — round bullets. Note the yellow N/Q/R/W and the lime G:
 * the component hard-codes text-white, so those bullets have very weak contrast.
 */
export function RoundBulletsFullRoster() {
  return (
    <div style={{ maxWidth: "36rem" }}>
      <SubwayLinesBadges lines={ALL_LINES} />
    </div>
  );
}

/** variant="compact" — small square pills, used in dense station lists. */
export function CompactPillsFullRoster() {
  return (
    <div style={{ maxWidth: "36rem" }}>
      <SubwayLinesBadges lines={ALL_LINES} variant="compact" />
    </div>
  );
}

/** Both variants across the size scale. */
export function Sizes() {
  const lines = ["4", "5", "6", "L", "N", "Q", "R", "W"];
  return (
    <div style={{ display: "grid", gap: "1.25rem", maxWidth: "32rem" }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ display: "grid", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280" }}>
            size {s}
          </span>
          <SubwayLinesBadges lines={lines} size={s} />
          <SubwayLinesBadges lines={lines} size={s} variant="compact" />
        </div>
      ))}
    </div>
  );
}

/** showCount, plus the dedupe + numbers-before-letters sort the component applies. */
export function ShowCountAndSorting() {
  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
      <div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
          Times Sq-42 St
        </div>
        <SubwayLinesBadges lines={["N", "7", "Q", "1", "R", "2", "W", "3", "S"]} showCount />
      </div>
      <div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
          Atlantic Av-Barclays Ctr (duplicates passed in, deduped on render)
        </div>
        <SubwayLinesBadges
          lines={["B", "D", "N", "Q", "R", "2", "3", "4", "5", "B", "D", "N"]}
          variant="compact"
          showCount
        />
      </div>
    </div>
  );
}

/** Empty input renders the component's own fallback copy. */
export function EmptyState() {
  return (
    <div style={{ maxWidth: "24rem" }}>
      <SubwayLinesBadges lines={[]} />
    </div>
  );
}
