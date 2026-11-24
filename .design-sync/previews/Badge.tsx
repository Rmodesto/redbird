import { Badge } from "redbird";

/** The tonal scale, mapped to the service meanings the site actually uses. */
export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <Badge variant="default">EXPRESS</Badge>
      <Badge variant="success">GOOD SERVICE</Badge>
      <Badge variant="warning">DELAYS</Badge>
      <Badge variant="error">SUSPENDED</Badge>
      <Badge variant="info">ADA ACCESSIBLE</Badge>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <Badge size="sm" variant="success">
        GOOD SERVICE
      </Badge>
      <Badge size="md" variant="success">
        GOOD SERVICE
      </Badge>
      <Badge size="lg" variant="success">
        GOOD SERVICE
      </Badge>
    </div>
  );
}

/** How badges read in context — the amenity row on a station page. */
export function StationAmenityRow() {
  return (
    <div style={{ maxWidth: "34rem" }}>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Times Sq-42 St
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <Badge variant="info">ADA ACCESSIBLE</Badge>
        <Badge variant="default">ELEVATORS</Badge>
        <Badge variant="default">OPEN 24 HOURS</Badge>
        <Badge variant="success">WI-FI</Badge>
        <Badge variant="warning">ESCALATOR OUT</Badge>
      </div>
    </div>
  );
}

/** Badges as the status column of a service board. */
export function ServiceStatusList() {
  const rows = [
    { line: "A", note: "8th Ave Express", status: "Good Service", variant: "success" as const },
    { line: "L", note: "14 St-Canarsie", status: "Delays", variant: "warning" as const },
    { line: "G", note: "Crosstown", status: "Planned Work", variant: "info" as const },
    { line: "7", note: "Flushing Local", status: "No Service", variant: "error" as const },
  ];
  return (
    <div style={{ maxWidth: "30rem", display: "grid", gap: "0.625rem" }}>
      {rows.map((r) => (
        <div
          key={r.line}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            paddingBottom: "0.625rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: "0.875rem" }}>
            <strong>{r.line}</strong> &middot; {r.note}
          </span>
          <Badge variant={r.variant}>{r.status}</Badge>
        </div>
      ))}
    </div>
  );
}
