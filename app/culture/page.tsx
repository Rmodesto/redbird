import type { ReactNode } from "react";
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { generateCollectionPageSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import SiteHeader from '@/components/site/SiteHeader';

const LABEL = "text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]";

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Culture - Movies, Music, Art & Popular Culture",
  "Explore how NYC subway has shaped popular culture through movies, music, art, literature, and internet culture. From classic films to viral memes, discover the subway's cultural impact.",
  [
    "NYC subway culture",
    "subway in movies",
    "NYC metro songs",
    "subway art photography",
    "New York transit culture",
    "subway memes internet",
    "NYC underground culture",
    "subway literature books",
    "metro pop culture",
    "subway social media",
  ]
);

const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Culture Archive",
  "Comprehensive collection of NYC subway's influence on popular culture, media, and arts",
  "stations",
  150
);

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Culture", url: "/culture" },
]);

interface CultureItem {
  id: string;
  category: string;
  title: string;
  description: string;
  year?: number;
  mediaType: 'movie' | 'song' | 'book' | 'art' | 'meme' | 'game' | 'tv';
  image?: string;
  link?: string;
  featured?: boolean;
}

const culturalContent: CultureItem[] = [
  // Movies & TV
  {
    id: "french-connection",
    category: "Movies",
    title: "The French Connection (1971)",
    description: "Oscar-winning film featuring the famous subway chase scene at Bay Ridge Avenue station.",
    year: 1971,
    mediaType: "movie",
    image: "🎬",
    featured: true
  },
  {
    id: "spider-man-2",
    category: "Movies",
    title: "Spider-Man 2 (2004)",
    description: "Epic train fight sequence filmed on the R train and elevated tracks in Queens.",
    year: 2004,
    mediaType: "movie",
    image: "🕷️"
  },
  {
    id: "money-train",
    category: "Movies",
    title: "Money Train (1995)",
    description: "Action thriller set entirely within the NYC subway system starring Wesley Snipes and Woody Harrelson.",
    year: 1995,
    mediaType: "movie",
    image: "💰"
  },
  {
    id: "seinfeld-subway",
    category: "TV Shows",
    title: "Seinfeld - The Subway (1992)",
    description: "Classic episode where each character takes a different subway journey across NYC.",
    year: 1992,
    mediaType: "tv",
    image: "📺",
    featured: true
  },

  // Music
  {
    id: "take-a-train",
    category: "Music",
    title: "Take the 'A' Train - Duke Ellington",
    description: "Jazz standard celebrating the A train to Harlem, NYC's unofficial subway anthem.",
    year: 1941,
    mediaType: "song",
    image: "🎷",
    featured: true
  },
  {
    id: "downtown-train",
    category: "Music",
    title: "Downtown Train - Tom Waits",
    description: "Melancholic ballad about late-night subway rides through NYC.",
    year: 1985,
    mediaType: "song",
    image: "🎵"
  },
  {
    id: "subway-joe",
    category: "Music",
    title: "Subway Joe - Joe Bataan",
    description: "Latin soul classic about a subway musician playing for tips.",
    year: 1968,
    mediaType: "song",
    image: "🪗"
  },

  // Art & Photography
  {
    id: "subway-murals",
    category: "Art",
    title: "MTA Arts & Design Murals",
    description: "Over 300 permanent artworks in subway stations, transforming daily commutes into gallery visits.",
    mediaType: "art",
    image: "🎨",
    featured: true
  },
  {
    id: "walker-evans",
    category: "Photography",
    title: "Walker Evans - Subway Portraits",
    description: "Iconic 1938-41 hidden camera photographs of subway passengers, capturing authentic NYC life.",
    year: 1941,
    mediaType: "art",
    image: "📸"
  },
  {
    id: "graffiti-culture",
    category: "Art",
    title: "Subway Graffiti Movement",
    description: "1970s-80s underground art movement that turned subway trains into moving canvases.",
    year: 1970,
    mediaType: "art",
    image: "🖌️"
  },

  // Literature
  {
    id: "colson-whitehead",
    category: "Literature",
    title: "The Colossus of New York",
    description: "Colson Whitehead's essay collection includes 'The Subway', a poetic exploration of underground NYC.",
    year: 2003,
    mediaType: "book",
    image: "📚"
  },
  {
    id: "rats-subway",
    category: "Literature",
    title: "Rats - Robert Sullivan",
    description: "Non-fiction exploration of NYC including extensive subway rat ecosystem documentation.",
    year: 2004,
    mediaType: "book",
    image: "📖"
  },

  // Internet Culture & Memes
  {
    id: "pizza-rat",
    category: "Memes",
    title: "Pizza Rat",
    description: "2015 viral video of rat dragging pizza slice down subway stairs, became global internet sensation.",
    year: 2015,
    mediaType: "meme",
    image: "🍕",
    featured: true
  },
  {
    id: "showtime",
    category: "Memes",
    title: "'Showtime!' Dancers",
    description: "Viral videos of acrobatic subway car performers, spawning countless TikTok recreations.",
    year: 2010,
    mediaType: "meme",
    image: "💃"
  },
  {
    id: "manspreading",
    category: "Social Media",
    title: "Manspreading Movement",
    description: "2014 social media campaign about subway etiquette that went global.",
    year: 2014,
    mediaType: "meme",
    image: "📱"
  },

  // Video Games
  {
    id: "gta-iv-subway",
    category: "Games",
    title: "Grand Theft Auto IV",
    description: "Detailed recreation of NYC subway system allowing players to ride authentic train routes.",
    year: 2008,
    mediaType: "game",
    image: "🎮"
  },
  {
    id: "a-train-games",
    category: "Games",
    title: "A-Train Series",
    description: "City-building games inspired by NYC transit planning and subway system management.",
    year: 1985,
    mediaType: "game",
    image: "🚊"
  }
];

const categories = [
  { name: "Movies & TV", icon: "🎬", count: culturalContent.filter(item => ['movie', 'tv'].includes(item.mediaType)).length },
  { name: "Music", icon: "🎵", count: culturalContent.filter(item => item.mediaType === 'song').length },
  { name: "Art & Photography", icon: "🎨", count: culturalContent.filter(item => item.mediaType === 'art').length },
  { name: "Literature", icon: "📚", count: culturalContent.filter(item => item.mediaType === 'book').length },
  { name: "Internet Culture", icon: "💻", count: culturalContent.filter(item => item.mediaType === 'meme').length },
  { name: "Video Games", icon: "🎮", count: culturalContent.filter(item => item.mediaType === 'game').length },
];

const featuredItems = culturalContent.filter(item => item.featured);
const featuredLead = featuredItems[0];

const timeline = [
  { decade: "1940s", highlight: "Duke Ellington's 'Take the A Train' becomes subway anthem", icon: "🎷" },
  { decade: "1970s", highlight: "Graffiti culture transforms trains into moving art galleries", icon: "🎨" },
  { decade: "1990s", highlight: "Hollywood discovers the subway: Money Train, French Connection", icon: "🎬" },
  { decade: "2000s", highlight: "Spider-Man brings superhero action to the rails", icon: "🕷️" },
  { decade: "2010s", highlight: "Social media era: Showtime dancers and viral moments", icon: "📱" },
  { decade: "2020s", highlight: "TikTok culture and pandemic-era subway stories", icon: "📹" },
];

/* Section header on the white paper: quoted eyebrow + h2, optionally a seam
   divider with a right-aligned meta label. Mirrors the reference "WATCH" block. */
function SectionHead({ eyebrow, title, meta }: { eyebrow: string; title: ReactNode; meta?: string }) {
  return (
    <div className="flex items-end justify-between gap-f21 border-b border-ink pb-f21">
      <div className="flex flex-col gap-f8">
        <span className={`quoted ${LABEL} text-muted`}>{eyebrow}</span>
        <h2 className="m-0 text-[clamp(26px,4vw,34px)] font-bold leading-[1.2] tracking-[-.01em] text-ink">
          {title}
        </h2>
      </div>
      {meta ? <span className={`shrink-0 ${LABEL} text-ink`}>{meta}</span> : null}
    </div>
  );
}

/* Reference card: 3px ink top rule, category tag, title, body. Dark-on-white. */
function MediaCard({ item }: { item: CultureItem }) {
  return (
    <article className="flex flex-col gap-f13 border-t-[3px] border-ink pt-f21">
      <span className="text-[26px] leading-none" aria-hidden="true">{item.image}</span>
      <span className={`${LABEL} text-muted`}>{item.category}</span>
      <span className="text-[clamp(21px,3vw,26px)] font-bold leading-[1.25] text-ink">{item.title}</span>
      <span className="text-[16px] leading-[26px] text-muted">{item.description}</span>
    </article>
  );
}

export default function CulturePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />

      <div className="min-h-screen bg-jet font-sans text-ink">
        <SiteHeader active="culture" />

        {/* ── Masthead: dark ripstop frame, golden two-column split ─────── */}
        <section className="surface-ripstop text-paper">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-f34 px-f21 pb-f55 pt-f34 md:px-f55 lg:grid-cols-golden-r lg:gap-f89 lg:pb-f144 lg:pt-f89">
            <div className="flex flex-col gap-f21">
              <span className={`quoted ${LABEL} text-graphite`}>Culture</span>
              <h1 className="m-0 text-[clamp(40px,8vw,68px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                Subway Culture
              </h1>
              <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-paper [text-wrap:pretty]">
                From iconic movie chase scenes to viral internet memes, the NYC subway has shaped popular
                culture for over a century. Explore how the world&apos;s busiest transit system became a
                cultural phenomenon.
              </p>
            </div>

            {/* Diagonal gradient feature panel with stitched tag + glass card */}
            <div
              className="relative aspect-[16/9] border border-ripstop"
              style={{ backgroundImage: "linear-gradient(160deg,#5A5A5A 0%,#262626 45%,#0B0B0B 100%)" }}
            >
              <span className="absolute left-f21 top-f21 text-[10px] font-bold uppercase tracking-[.08em] text-graphite">
                Feature Image · 16:9
              </span>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(48px,9vw,89px)] opacity-80" aria-hidden="true">
                {featuredLead?.image}
              </span>
              <span className="absolute -right-[13px] top-f55 hidden h-f21 w-f55 bg-tag lg:block" aria-hidden="true" />
              <div className="absolute bottom-f21 left-f21 flex w-[min(100%,377px)] flex-col gap-f8 border border-white/20 bg-smoke p-f21 text-paper backdrop-blur-md lg:-bottom-f34 lg:-left-f34">
                <span className={`quoted ${LABEL}`}>Featured</span>
                <span className="text-[21px] font-bold leading-[26px]">{featuredLead?.title}</span>
                <span className={`${LABEL} text-paper`}>Read the story →</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body: white paper card inset into the dark frame ──────────── */}
        <div className="mx-auto max-w-[1440px] px-f21 pb-f55 md:px-f55 md:pb-f89">
          <main className="panel flex flex-col gap-f55 p-f21 md:gap-f89 md:p-f89">

            {/* Featured Cultural Moments */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Featured" title="Featured Cultural Moments" />
              <div className="grid grid-cols-1 gap-f34 md:grid-cols-2 lg:grid-cols-4">
                {featuredItems.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* By category */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="By category" title="Culture by the numbers" />
              <div className="grid grid-cols-2 border-l border-t border-seam md:grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <div key={category.name} className="flex flex-col gap-f5 border-b border-r border-seam p-f21">
                    <span className="text-[26px] leading-none" aria-hidden="true">{category.icon}</span>
                    <span className="text-[34px] font-bold leading-[42px] text-ink">{category.count}</span>
                    <span className={`${LABEL} text-muted`}>{category.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Movies & TV */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Watch" title={<><span aria-hidden="true">🎬</span> Movies &amp; Television</>} meta="On Screen" />
              <div className="grid grid-cols-1 gap-f34 md:grid-cols-2 lg:grid-cols-3">
                {culturalContent
                  .filter(item => ['movie', 'tv'].includes(item.mediaType))
                  .slice(0, 6)
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
              <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-muted">
                The NYC subway has been the backdrop for countless memorable film and TV moments.
                From high-octane chase scenes to intimate character moments, the subway&apos;s unique
                atmosphere has made it a favorite location for storytellers worldwide.
              </p>
            </section>

            {/* Music */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Listen" title={<><span aria-hidden="true">🎵</span> Music &amp; Songs</>} meta="On Record" />
              <div className="grid grid-cols-1 gap-f34 md:grid-cols-2 lg:grid-cols-3">
                {culturalContent
                  .filter(item => item.mediaType === 'song')
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
              <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-muted">
                Music and the subway have been intertwined since Duke Ellington&apos;s &quot;Take the &apos;A&apos; Train&quot; became
                an unofficial anthem. Street performers, subway musicians, and countless songs celebrating
                or lamenting subway life have created a rich musical heritage.
              </p>
            </section>

            {/* Art & Photography */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Look" title={<><span aria-hidden="true">🎨</span> Art &amp; Photography</>} meta="On Walls" />
              <div className="grid grid-cols-1 gap-f34 md:grid-cols-2 lg:grid-cols-3">
                {culturalContent
                  .filter(item => item.mediaType === 'art')
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
              <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-muted">
                From the MTA&apos;s Arts &amp; Design program transforming stations into galleries, to the underground
                graffiti movement of the 1970s-80s, the subway has been both canvas and subject for
                countless artists and photographers documenting urban life.
              </p>
            </section>

            {/* Internet Culture & Memes */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Scroll" title={<><span aria-hidden="true">💻</span> Internet Culture &amp; Memes</>} meta="On Feed" />
              <div className="grid grid-cols-1 gap-f34 md:grid-cols-2 lg:grid-cols-3">
                {culturalContent
                  .filter(item => item.mediaType === 'meme')
                  .map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
              </div>
              <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-muted">
                The digital age has transformed subway culture, with viral moments like Pizza Rat becoming
                global phenomena. Social media has amplified both the quirky and serious aspects of subway life,
                creating new forms of urban folklore.
              </p>
            </section>

            {/* Timeline — list rows, reference "READ" block cadence */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Timeline" title="NYC Subway Through the Decades" />
              <div className="border-t border-ink">
                {timeline.map((period) => (
                  <div
                    key={period.decade}
                    className="flex items-center gap-f21 border-b border-seam py-f21"
                  >
                    <span className="text-[34px] leading-none" aria-hidden="true">{period.icon}</span>
                    <div className="min-w-0">
                      <h3 className="m-0 text-[21px] font-bold leading-[26px] text-ink">{period.decade}</h3>
                      <p className="m-0 mt-[3px] text-[16px] leading-[24px] text-muted">{period.highlight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community closing block */}
            <section className="flex max-w-f610 flex-col gap-f21">
              <span className={`quoted ${LABEL} text-muted`}>Community</span>
              <h2 className="m-0 text-[clamp(26px,4vw,34px)] font-bold leading-[1.2] tracking-[-.01em] text-ink">
                Share Your Subway Culture
              </h2>
              <p className="m-0 text-[18px] leading-[29px] text-muted [text-wrap:pretty]">
                Have a favorite subway movie scene, song, or viral moment? Help us build the most comprehensive
                archive of NYC subway culture by sharing your discoveries.
              </p>
            </section>

          </main>
        </div>
      </div>
    </>
  );
}
