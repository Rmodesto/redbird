import { Card, Badge, SubwayLineBadge } from "redbird";

/** The variant axis. 'elevated' is the house card. */
export function Variants() {
  const items = [
    { variant: "default" as const, label: "default", copy: "White surface, 1px grey border." },
    { variant: "outlined" as const, label: "outlined", copy: "Heavier 2px border, no shadow." },
    { variant: "elevated" as const, label: "elevated", copy: "Shadow-lg — the house card." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1.25rem" }}>
      {items.map((it) => (
        <Card key={it.label} variant={it.variant}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <SubwayLineBadge line="A" size="sm" />
            <strong style={{ fontSize: "0.9375rem" }}>Jay St-MetroTech</strong>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "#4b5563", margin: 0 }}>{it.copy}</p>
        </Card>
      ))}
    </div>
  );
}

/** Padding scale, same content in each. */
export function PaddingScale() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "1rem" }}>
      {(["none", "sm", "md", "lg"] as const).map((p) => (
        <Card key={p} variant="outlined" padding={p}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280" }}>
            padding {p}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>14 St-Union Sq</div>
        </Card>
      ))}
    </div>
  );
}

/** A realistic station card — the pattern this component mostly ships as. */
export function StationCard() {
  return (
    <div style={{ maxWidth: "26rem" }}>
      <Card variant="elevated" hover>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
              Jackson Hts-Roosevelt Av
            </h3>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
              Queens &middot; Underground &middot; Opened 1933
            </p>
          </div>
          <Badge variant="success">GOOD SERVICE</Badge>
        </div>
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "0.875rem" }}>
          {["E", "F", "M", "R", "7"].map((l) => (
            <SubwayLineBadge key={l} line={l} size="sm" />
          ))}
        </div>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.5 }}>
          One of the busiest transfer complexes outside Manhattan, linking the Flushing
          line to the IND Queens Boulevard local and express tracks.
        </p>
      </Card>
    </div>
  );
}

/** padding="none" lets the child own its own edges — used for media-topped cards. */
export function PaddingNoneComposition() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <Card variant="elevated" padding="none">
        <div
          style={{
            background: "#0039A6",
            color: "#ffffff",
            padding: "1.25rem 1.5rem",
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>8TH AVE EXPRESS</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>A Train</div>
        </div>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151" }}>
            Inwood-207 St to Far Rockaway-Mott Av. The longest one-seat ride in the
            system at 31 miles.
          </p>
        </div>
      </Card>
    </div>
  );
}
