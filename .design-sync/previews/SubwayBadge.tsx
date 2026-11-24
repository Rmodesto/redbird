import { SubwayBadge } from "redbird";

type Line = { id: string; name: string; color: string; textColor: string };

/**
 * The caller supplies Tailwind colour CLASS strings, and `name` is the
 * designation drawn inside the badge (that is how /line/[line-id] builds it).
 */
const LINES: Line[] = [
  { id: "1", name: "1", color: "bg-red-600", textColor: "text-white" },
  { id: "2", name: "2", color: "bg-red-600", textColor: "text-white" },
  { id: "3", name: "3", color: "bg-red-600", textColor: "text-white" },
  { id: "4", name: "4", color: "bg-green-600", textColor: "text-white" },
  { id: "5", name: "5", color: "bg-green-600", textColor: "text-white" },
  { id: "6", name: "6", color: "bg-green-600", textColor: "text-white" },
  { id: "7", name: "7", color: "bg-purple-600", textColor: "text-white" },
  { id: "a", name: "A", color: "bg-blue-600", textColor: "text-white" },
  { id: "c", name: "C", color: "bg-blue-600", textColor: "text-white" },
  { id: "e", name: "E", color: "bg-blue-600", textColor: "text-white" },
  { id: "b", name: "B", color: "bg-orange-500", textColor: "text-white" },
  { id: "d", name: "D", color: "bg-orange-500", textColor: "text-white" },
  { id: "f", name: "F", color: "bg-orange-500", textColor: "text-white" },
  { id: "m", name: "M", color: "bg-orange-500", textColor: "text-white" },
  { id: "g", name: "G", color: "bg-green-500", textColor: "text-black" },
  { id: "j", name: "J", color: "bg-amber-600", textColor: "text-white" },
  { id: "z", name: "Z", color: "bg-amber-600", textColor: "text-white" },
  { id: "l", name: "L", color: "bg-gray-500", textColor: "text-white" },
  { id: "n", name: "N", color: "bg-yellow-500", textColor: "text-black" },
  { id: "q", name: "Q", color: "bg-yellow-500", textColor: "text-black" },
  { id: "r", name: "R", color: "bg-yellow-500", textColor: "text-black" },
  { id: "w", name: "W", color: "bg-yellow-500", textColor: "text-black" },
  { id: "s", name: "S", color: "bg-gray-600", textColor: "text-white" },
];

/** The full roster at the default size. Every badge links to /line/<id>. */
export function FullLineRoster() {
  return (
    <div style={{ maxWidth: "36rem", display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
      {LINES.map((line) => (
        <SubwayBadge key={line.id} line={line} />
      ))}
    </div>
  );
}

/** 32 / 48 / 64px — a deliberately larger scale than SubwayLineBadge. */
export function Sizes() {
  const sample = LINES.filter((l) => ["a", "d", "q", "7", "l"].includes(l.id));
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ width: "3rem", fontSize: "0.75rem", color: "#6b7280" }}>{s}</span>
          {sample.map((line) => (
            <SubwayBadge key={line.id} line={line} size={s} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** clickable={false} drops the link and the hover scaling — used in the line-page hero. */
export function LineHero() {
  const a = LINES.find((l) => l.id === "a") as Line;
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e40af 0%, #374151 100%)",
        padding: "2rem",
        borderRadius: "0.5rem",
        color: "#ffffff",
        maxWidth: "36rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <SubwayBadge line={a} size="lg" clickable={false} />
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>8th Ave Express</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#e5e7eb" }}>
            Inwood-207 St to Far Rockaway-Mott Av
          </p>
        </div>
      </div>
    </div>
  );
}

/** Clickable vs static, side by side. */
export function ClickableComparison() {
  const sample = LINES.filter((l) => ["1", "e", "q", "g"].includes(l.id));
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ width: "8rem", fontSize: "0.75rem", color: "#6b7280" }}>clickable (default)</span>
        {sample.map((line) => (
          <SubwayBadge key={line.id} line={line} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ width: "8rem", fontSize: "0.75rem", color: "#6b7280" }}>clickable=false</span>
        {sample.map((line) => (
          <SubwayBadge key={line.id} line={line} clickable={false} />
        ))}
      </div>
    </div>
  );
}
