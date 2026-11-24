import { AdSlot } from "redbird";

const label = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#6b7280",
  marginBottom: "0.5rem",
};

/** Every placeholder size, stacked so the height difference is readable. */
export function Sizes() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "46rem" }}>
      <div>
        <div style={label}>banner — default</div>
        <AdSlot size="banner" />
      </div>
      <div>
        <div style={label}>leaderboard</div>
        <AdSlot size="leaderboard" />
      </div>
      <div>
        <div style={label}>mobile_banner</div>
        <AdSlot size="mobile_banner" />
      </div>
      <div>
        <div style={label}>square</div>
        <AdSlot size="square" />
      </div>
    </div>
  );
}

/** The square unit as it sits in a station-page sidebar. */
export function SidebarSquare() {
  return (
    <div style={{ maxWidth: "20rem" }}>
      <AdSlot size="square" />
    </div>
  );
}

/** Leaderboard between two blocks of article copy, where /blog places it. */
export function InArticleFlow() {
  return (
    <div style={{ maxWidth: "40rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Transferring at Jackson Hts-Roosevelt Av
      </h3>
      <p style={{ color: "#4b5563", lineHeight: 1.75, marginBottom: "1.5rem" }}>
        The 7 runs above the E F M R here, so every transfer costs you a staircase or the
        mezzanine elevator. Northbound riders heading for the Queens Blvd express should stay on
        the lower level rather than walking the platform.
      </p>
      <AdSlot size="leaderboard" />
      <p style={{ color: "#4b5563", lineHeight: 1.75, marginTop: "1.5rem" }}>
        Late nights the M does not run and the R replaces it local, which adds about six minutes
        to the trip toward Forest Hills-71 Av.
      </p>
    </div>
  );
}

/** `className` passes through for spacing and width constraints. */
export function WithClassName() {
  return (
    <div style={{ maxWidth: "40rem" }}>
      <AdSlot size="banner" className="my-4 max-w-md mx-auto" />
    </div>
  );
}
