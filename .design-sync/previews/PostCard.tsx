import { PostCard } from "redbird";

// Self-contained stand-ins for the post artwork. The real cards point at
// /blog-images/*, which does not resolve from the design-system bundle — an
// unresolved src renders the card incomplete, so previews ship their own.
const photo = (from: string, to: string, label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="640" height="400" fill="url(#g)"/>` +
      `<rect x="0" y="286" width="640" height="8" fill="rgba(255,255,255,.22)"/>` +
      `<text x="32" y="356" font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="rgba(255,255,255,.92)">${label}</text>` +
      `</svg>`
  );

const basePost = {
  title: "Why the 7 Train Sounds Different From Every Other Line",
  slug: "why-the-7-train-sounds-different",
  excerpt:
    "The Flushing Line runs Kawasaki R188s on elevated track for most of its route. That combination produces a flatter, brighter platform tone than anything underground.",
  category: "CULTURE",
  tags: ["7 train", "field recording", "Queens"],
  featuredImage: photo("#5b2b6b", "#8e3b52", "7 · Flushing Line"),
  featuredImageAlt: "A 7 train rounding an elevated curve in Queens",
  authorName: "Rafael Modesto",
  authorImage: null,
  publishedAt: "2026-03-14T00:00:00.000Z",
  readingTimeMinutes: 6,
  views: 2841,
};

export function Default() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <PostCard post={basePost} />
    </div>
  );
}

export function WithoutImage() {
  return (
    <div style={{ maxWidth: "22rem" }}>
      <PostCard
        post={{
          ...basePost,
          title: "A Field Guide to the Six Sounds of a Closing Door",
          slug: "six-sounds-of-a-closing-door",
          excerpt:
            "Every rolling-stock generation announces itself differently. Here is how to tell an R46 from an R211 without looking up.",
          category: "GUIDES",
          tags: ["rolling stock", "audio"],
          featuredImage: null,
          featuredImageAlt: null,
          readingTimeMinutes: 4,
          views: 931,
        }}
      />
    </div>
  );
}

/** Three-up, the grid the blog listing actually renders. */
export function InGrid() {
  const posts = [
    basePost,
    {
      ...basePost,
      title: "Mapping the Last Redbirds",
      slug: "mapping-the-last-redbirds",
      excerpt:
        "The R33s were retired in 2003 and sunk off the Delaware coast. A few survive on work trains and in museums.",
      category: "HISTORY",
      tags: ["redbird", "R33"],
      featuredImage: photo("#0b2f6b", "#1d6fa5", "A · Eighth Avenue"),
      featuredImageAlt: "An A train arriving at the platform",
      readingTimeMinutes: 9,
      views: 5120,
    },
    {
      ...basePost,
      title: "Which Stations Are Actually Accessible?",
      slug: "which-stations-are-actually-accessible",
      excerpt:
        "ADA compliance and a working elevator are not the same claim. We checked all 472 stations against live outage data.",
      category: "TIPS",
      tags: ["accessibility", "ADA"],
      featuredImage: null,
      featuredImageAlt: null,
      readingTimeMinutes: 7,
      views: 1744,
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1.5rem" }}>
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </div>
  );
}
