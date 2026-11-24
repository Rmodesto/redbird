import { ServiceAlert } from "redbird";

const stack = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.75rem",
  alignItems: "flex-start",
};

/** The three service states, in the order a status strip reports them. */
export function Types() {
  return (
    <div style={stack}>
      <ServiceAlert
        type="good_service"
        message="1 2 3 — Good service on the Broadway-7 Av lines"
      />
      <ServiceAlert
        type="delay"
        message="A C E running with delays due to signal problems at 59 St-Columbus Circle"
      />
      <ServiceAlert
        type="service_change"
        message="No N W service between Queensboro Plaza and Astoria-Ditmars Blvd this weekend"
      />
    </div>
  );
}

/** Short messages, the length the station header actually carries. */
export function ShortMessages() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <ServiceAlert type="good_service" message="Good service" />
      <ServiceAlert type="delay" message="Delays uptown" />
      <ServiceAlert type="service_change" message="Weekend reroute" />
    </div>
  );
}

/** `icon` overrides the emoji the type would otherwise pick. */
export function CustomIcon() {
  return (
    <div style={stack}>
      <ServiceAlert
        type="delay"
        icon="🚧"
        message="7 express suspended — track work between 74 St-Broadway and Mets-Willets Point"
      />
      <ServiceAlert
        type="service_change"
        icon="🛗"
        message="Elevator out of service at Jackson Hts-Roosevelt Av (mezzanine to E F M R platform)"
      />
    </div>
  );
}

/** How the alerts read above a station name, which is where they ship. */
export function InStationHeader() {
  return (
    <div style={{ maxWidth: "38rem" }}>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Times Sq-42 St
      </div>
      <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
        Manhattan · 1 2 3 7 N Q R W S
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <ServiceAlert type="good_service" message="1 2 3 — Good service" />
        <ServiceAlert type="delay" message="N Q R — Delays southbound" />
        <ServiceAlert type="service_change" message="S Shuttle — Every 12 min" />
      </div>
    </div>
  );
}
