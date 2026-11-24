import { Footer } from "redbird";

/**
 * The site footer as every page renders it: four columns on md+, dark
 * gray-900 ground, Explore / Legal / Contact rails, copyright bar underneath.
 */
export function Default() {
  return <Footer onOpenCookieSettings={() => {}} />;
}

/**
 * `onOpenCookieSettings` is optional — omitted, the Cookie Preferences button
 * still renders and simply does nothing on click.
 */
export function WithoutCookieHandler() {
  return <Footer />;
}

/**
 * Closing out a page. The footer supplies its own max-w-7xl rail and dark
 * ground, so it butts straight against the last light section with no spacer.
 */
export function InPageContext() {
  return (
    <div>
      <div style={{ padding: "0 1.5rem 2.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Nearby stations
        </h2>
        <p style={{ color: "#4b5563", marginBottom: "1.25rem" }}>
          Five stops within a half mile of 14 St-Union Sq.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", color: "#374151" }}>
          <span>23 St (6)</span>
          <span>·</span>
          <span>3 Av (L)</span>
          <span>·</span>
          <span>8 St-NYU (R W)</span>
          <span>·</span>
          <span>6 Av (F M L)</span>
          <span>·</span>
          <span>Astor Pl (6)</span>
        </div>
      </div>
      <Footer onOpenCookieSettings={() => {}} />
    </div>
  );
}
