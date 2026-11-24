import { StatCard } from "redbird";

/** The homepage system-stats strip, as it ships. */
export function SystemStats() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "1.5rem" }}>
      <StatCard title="Stations" value="472" />
      <StatCard title="Lines" value="27" />
      <StatCard title="Miles of Track" value="245" />
      <StatCard title="Daily Riders" value="5M+" />
    </div>
  );
}

/** valueColor carries the semantic, not the label. */
export function ValueColors() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "1.5rem" }}>
      <StatCard title="Station Score" value="92" subtitle="Excellent" valueColor="success" />
      <StatCard title="Elevator Status" value="2 out" subtitle="Partial service" valueColor="warning" />
      <StatCard title="Felonies" value="38" subtitle="Past 12 months" valueColor="error" />
      <StatCard title="Platforms" value="4" subtitle="Underground" />
    </div>
  );
}

export function WithTrendAndIcon() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1.5rem" }}>
      <StatCard
        title="Weekly Ridership"
        value="1.2M"
        trend="up"
        trendValue="4.1% vs last week"
        icon={<span style={{ fontSize: "1.5rem" }}>🚇</span>}
      />
      <StatCard
        title="On-Time Rate"
        value="78%"
        trend="down"
        trendValue="2.3% vs last week"
        icon={<span style={{ fontSize: "1.5rem" }}>🕐</span>}
      />
      <StatCard
        title="Rodent Reports"
        value="0"
        subtitle="Past 30 days"
        valueColor="success"
        trend="neutral"
        trendValue="No change"
        icon={<span style={{ fontSize: "1.5rem" }}>🐀</span>}
      />
    </div>
  );
}
