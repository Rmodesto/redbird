import { useEffect, useRef } from "react";
import { GlassmorphicTooltip } from "redbird";

// GlassmorphicTooltip is a cursor-following tooltip: it only renders its
// surface while the trigger is hovered, and it positions itself at the live
// cursor coordinates. A static capture therefore shows the trigger alone.
// Rather than hand-drawing a lookalike, these cells drive the component's own
// hover path with a real MouseEvent at a fixed coordinate, so what the sheet
// shows is the component's actual output, not a mock of it.
function AutoHover({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const trigger = ref.current?.firstElementChild as HTMLElement | null;
    if (!trigger) return;
    trigger.dispatchEvent(
      new MouseEvent("mouseover", { bubbles: true, clientX: x, clientY: y })
    );
  }, [x, y]);
  return <div ref={ref}>{children}</div>;
}

const MTA_COLORS: Record<string, string> = {
  "1": "#EE352E", "2": "#EE352E", "3": "#EE352E",
  "4": "#00933C", "5": "#00933C", "6": "#00933C",
  "7": "#B933AD",
  A: "#0039A6", C: "#0039A6", E: "#0039A6",
  B: "#FF6319", D: "#FF6319", F: "#FF6319", M: "#FF6319",
  G: "#6CBE45", J: "#996633", Z: "#996633", L: "#A7A9AC",
  N: "#FCCC0A", Q: "#FCCC0A", R: "#FCCC0A", W: "#FCCC0A",
  S: "#808183",
};

/** The station-tooltip body the map passes as `content` (see CLAUDE.md). */
function StationTooltipContent({ name, lines }: { name: string; lines: string[] }) {
  return (
    <div className="glassmorphic-tooltip-content">
      <div className="font-semibold text-sm mb-2" style={{ color: "white" }}>
        {name}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {lines.map((line) => (
          <span
            key={line}
            className="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
            style={{ backgroundColor: MTA_COLORS[line] || "#000000", color: "white" }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A station marker on the dark map canvas — the trigger as the map draws it. */
function StationMarker({ color = "#FFFFFF", label }: { color?: string; label?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <span
        style={{
          display: "block",
          width: "14px",
          height: "14px",
          borderRadius: "9999px",
          background: color,
          border: "3px solid #111827",
          boxShadow: "0 0 0 2px rgba(255,255,255,.35)",
          flex: "none",
        }}
      />
      {label ? (
        <span
          style={{
            font: "600 12px Arial, Helvetica, sans-serif",
            color: "rgba(255,255,255,.88)",
            textShadow: "0 1px 2px rgba(0,0,0,.85)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** Stand-in for the MapLibre canvas: dark basemap plus a drawn 7-line path. */
function MapCanvas({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        borderRadius: "8px",
        overflow: "hidden",
        background: "linear-gradient(160deg,#16202e 0%,#0d141d 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          top: "52%",
          height: "6px",
          borderRadius: "9999px",
          background: "#B933AD",
        }}
      />
      {children}
    </div>
  );
}

/**
 * Hovering a station marker on the interactive map — the component's one real
 * use. The hover is driven by a dispatched MouseEvent so the tooltip surface
 * actually renders in a static capture.
 */
export function StationHover() {
  return (
    <MapCanvas height={340}>
      <div style={{ position: "absolute", left: "150px", top: "88px" }}>
        <AutoHover x={162} y={118}>
          <GlassmorphicTooltip
            delay={0}
            content={
              <StationTooltipContent
                name="Jackson Hts-Roosevelt Av"
                lines={["7", "E", "F", "M", "R"]}
              />
            }
          >
            <StationMarker color="#B933AD" />
          </GlassmorphicTooltip>
        </AutoHover>
      </div>
    </MapCanvas>
  );
}

/**
 * A single-line stop: the same tooltip with one badge, showing how the body
 * collapses when a platform serves one train.
 */
export function SingleLineStation() {
  return (
    <MapCanvas height={300}>
      <div style={{ position: "absolute", left: "140px", top: "80px" }}>
        <AutoHover x={150} y={108}>
          <GlassmorphicTooltip
            delay={0}
            offset={{ x: 14, y: -6 }}
            content={<StationTooltipContent name="Broad Channel" lines={["A", "S"]} />}
          >
            <StationMarker color="#0039A6" />
          </GlassmorphicTooltip>
        </AutoHover>
      </div>
    </MapCanvas>
  );
}

/**
 * Resting state, no hover: the component renders only its trigger, wrapped in
 * whatever className it was given. This is what the map looks like before the
 * cursor arrives — and what any static capture of an un-hovered tooltip shows.
 */
export function TriggersAtRest() {
  const stations: Array<{ name: string; lines: string[]; color: string; left: string; top: string }> = [
    { name: "Times Sq-42 St", lines: ["1", "2", "3", "7", "N", "Q", "R", "W", "S"], color: "#EE352E", left: "40px", top: "60px" },
    { name: "Grand Central-42 St", lines: ["4", "5", "6", "7", "S"], color: "#00933C", left: "300px", top: "104px" },
    { name: "Queensboro Plaza", lines: ["7", "N", "W"], color: "#B933AD", left: "150px", top: "170px" },
    { name: "Jackson Hts-Roosevelt Av", lines: ["7", "E", "F", "M", "R"], color: "#FF6319", left: "430px", top: "216px" },
  ];
  return (
    <MapCanvas height={300}>
      {stations.map((s) => (
        <div key={s.name} style={{ position: "absolute", left: s.left, top: s.top }}>
          <GlassmorphicTooltip
            delay={0}
            content={<StationTooltipContent name={s.name} lines={s.lines} />}
          >
            <StationMarker color={s.color} label={s.name} />
          </GlassmorphicTooltip>
        </div>
      ))}
    </MapCanvas>
  );
}
