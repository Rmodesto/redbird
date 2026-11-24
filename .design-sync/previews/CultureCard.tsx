import { CultureCard } from "redbird";

/** The canonical card. `image` is an emoji, not a URL. */
export function Default() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <CultureCard
        category="Film"
        title="The Taking of Pelham One Two Three"
        description="The 1974 hijacking thriller shot on the IRT Lexington Avenue Line, back when the 6 still ran redbirds."
        image="🎬"
        href="/culture/pelham-one-two-three"
      />
    </div>
  );
}

/** Without `href` the card renders the same content, just not as a link. */
export function WithoutLink() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <CultureCard
        category="Music"
        title="Busking at 14 St-Union Sq"
        description="MTA's Music Under New York program auditions roughly 70 acts a year for the mezzanine spots riders hear most."
        image="🎷"
      />
    </div>
  );
}

/** Default media emoji (camera) when `image` is omitted. */
export function DefaultImage() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <CultureCard
        category="Photography"
        title="Bruce Davidson's Subway"
        description="Shot between 1980 and 1985 on graffiti-covered IRT and BMT cars, the series still defines how the era looks."
        href="/culture/bruce-davidson-subway"
      />
    </div>
  );
}

/** Three-up, the grid the culture page renders. */
export function InGrid() {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "2rem" }}
    >
      <CultureCard
        category="Art"
        title="Tom Otterness, Life Underground"
        description="The bronze figures scattered across 14 St-8 Av have been scaring and delighting A C E L riders since 2001."
        image="🗿"
        href="/culture/life-underground"
      />
      <CultureCard
        category="Television"
        title="The Mosaics of 72 St"
        description="Broadway-7 Av station tilework became shorthand for 'New York' in a decade of title sequences."
        image="🚇"
        href="/culture/72-st-mosaics"
      />
      <CultureCard
        category="History"
        title="The Abandoned City Hall Loop"
        description="The 1904 IRT showpiece closed in 1945. The 6 still curves through it on its way back uptown."
        image="🏛️"
        href="/culture/city-hall-loop"
      />
    </div>
  );
}
