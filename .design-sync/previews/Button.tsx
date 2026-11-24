import { Button } from "redbird";

export function Variants() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      <Button variant="primary">View arrivals</Button>
      <Button variant="secondary">Browse stations</Button>
      <Button variant="outline">All subway lines</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      <Button variant="primary" disabled>
        Loading arrivals
      </Button>
      <Button variant="outline" disabled>
        Unavailable
      </Button>
    </div>
  );
}

export function FullWidth() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <Button variant="primary" fullWidth>
        Play platform sounds
      </Button>
    </div>
  );
}
