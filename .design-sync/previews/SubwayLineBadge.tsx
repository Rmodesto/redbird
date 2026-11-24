import { SubwayLineBadge } from "redbird";

const DIVISIONS: Array<{ label: string; lines: string[] }> = [
  { label: "IRT", lines: ["1", "2", "3", "4", "5", "6", "7"] },
  { label: "IND 8th Ave", lines: ["A", "C", "E"] },
  { label: "IND 6th Ave", lines: ["B", "D", "F", "M"] },
  { label: "BMT Broadway", lines: ["N", "Q", "R", "W"] },
  { label: "Other", lines: ["G", "J", "Z", "L", "S"] },
];

/** The full MTA roster, grouped by division. The most useful card for this product. */
export function FullLineRoster() {
  return (
    <div style={{ display: "grid", gap: "0.875rem" }}>
      {DIVISIONS.map((d) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              width: "7rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#6b7280",
            }}
          >
            {d.label}
          </span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {d.lines.map((l) => (
              <SubwayLineBadge key={l} line={l} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** 24 / 32 / 40px. */
export function Sizes() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ width: "3rem", fontSize: "0.75rem", color: "#6b7280" }}>{s}</span>
          {["1", "A", "D", "Q", "G", "L"].map((l) => (
            <SubwayLineBadge key={l} line={l} size={s} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Case-insensitive: lowercase input is upcased on render. */
export function CaseInsensitive() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {["a", "q", "g", "j", "s"].map((l) => (
        <SubwayLineBadge key={l} line={l} />
      ))}
      <span style={{ fontSize: "0.8125rem", color: "#6b7280", marginLeft: "0.5rem" }}>
        passed as &quot;a&quot;, &quot;q&quot;, &quot;g&quot;, &quot;j&quot;, &quot;s&quot;
      </span>
    </div>
  );
}

/** Inline in a transfer list — the real call site. */
export function InTransferList() {
  const rows = [
    { station: "Times Sq-42 St", lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "S"] },
    { station: "14 St-Union Sq", lines: ["4", "5", "6", "L", "N", "Q", "R", "W"] },
    { station: "Jackson Hts-Roosevelt Av", lines: ["7", "E", "F", "M", "R"] },
    { station: "Atlantic Av-Barclays Ctr", lines: ["2", "3", "4", "5", "B", "D", "N", "Q", "R", "W"] },
  ];
  return (
    <div style={{ maxWidth: "36rem", display: "grid", gap: "0.75rem" }}>
      {rows.map((r) => (
        <div
          key={r.station}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            paddingBottom: "0.75rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{r.station}</span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", justifyContent: "flex-end" }}>
            {r.lines.map((l) => (
              <SubwayLineBadge key={l} line={l} size="sm" />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
