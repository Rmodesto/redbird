import { Section, Card, Badge, SubwayLineBadge } from "redbird";

/** Title + subtitle + emoji icon — the full header, as station pages use it. */
export function TitleSubtitleIcon() {
  return (
    <div style={{ maxWidth: "40rem" }}>
      <Section
        icon="🚇"
        title="Live Arrivals"
        subtitle="Real-time departures from Times Sq-42 St, updated every 30 seconds from the MTA GTFS feed."
      >
        <Card variant="elevated">
          <div style={{ display: "grid", gap: "0.625rem" }}>
            {[
              { line: "1", dest: "Van Cortlandt Park-242 St", min: "2 min" },
              { line: "2", dest: "Flatbush Av-Brooklyn College", min: "4 min" },
              { line: "3", dest: "Harlem-148 St", min: "7 min" },
            ].map((a) => (
              <div
                key={a.line + a.dest}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <SubwayLineBadge line={a.line} size="sm" />
                <span style={{ flex: 1, fontSize: "0.875rem" }}>{a.dest}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>{a.min}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}

/** Title only — the common case on index pages. */
export function TitleOnly() {
  return (
    <div style={{ maxWidth: "40rem" }}>
      <Section title="Nearby Stations">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1rem" }}>
          {["Grand Central-42 St", "Bryant Park-5 Av", "34 St-Herald Sq"].map((s) => (
            <Card key={s} variant="outlined" padding="sm">
              <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{s}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Manhattan</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

/** No header at all — Section degrades to a spaced content stack. */
export function HeaderlessStack() {
  return (
    <div style={{ maxWidth: "32rem" }}>
      <Section>
        <Card variant="default">
          <strong style={{ fontSize: "0.9375rem" }}>Platform recording</strong>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#4b5563" }}>
            R160 door chime, 14 St-Union Sq northbound. 0:12
          </p>
        </Card>
        <Card variant="default">
          <strong style={{ fontSize: "0.9375rem" }}>Platform recording</strong>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "#4b5563" }}>
            Express train passing, 72 St on the 2/3. 0:21
          </p>
        </Card>
      </Section>
    </div>
  );
}

/** Two sections stacked, as a station page builds its body. */
export function StackedSections() {
  return (
    <div style={{ maxWidth: "40rem", display: "grid", gap: "2rem" }}>
      <Section icon="♿" title="Accessibility" subtitle="Elevator and ramp coverage at this complex.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Badge variant="info">ADA ACCESSIBLE</Badge>
          <Badge variant="success">4 ELEVATORS</Badge>
          <Badge variant="warning">ESCALATOR OUT</Badge>
        </div>
      </Section>
      <Section icon="🎧" title="Station Sounds" subtitle="Field recordings taken on the platform.">
        <Card variant="elevated" padding="sm">
          <div style={{ fontSize: "0.875rem" }}>
            <strong>Turnstile clack &amp; crowd</strong> &mdash; Jackson Hts-Roosevelt Av, 6:40 PM
          </div>
        </Card>
      </Section>
    </div>
  );
}
