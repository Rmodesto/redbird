import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";
import { generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import SiteHeader from '@/components/site/SiteHeader';

export const metadata: Metadata = generateSEOMetadata({
  title: 'NYC Subway History - Abandoned Stations & Hidden Tracks',
  description: 'Explore the history of NYC subway including abandoned stations, closed platforms, ghost stations, and the stories behind the system. From 1904 to today.',
  keywords: [
    'abandoned subway stations nyc',
    'nyc subway history',
    'closed subway stations',
    'city hall station nyc',
    'ghost station nyc subway',
    'old nyc subway stations',
    'historic subway stations',
    'subway ghost stations',
    'mta history',
    'nyc transit museum',
  ],
  canonical: '/history',
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "History", url: "/history" },
]);

const LABEL = "text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]";
const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23262626%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

function Stat({ value, label, accent, br, bb }: { value: string; label: string; accent?: boolean; br?: boolean; bb?: boolean }) {
  return (
    <div className={`flex flex-col gap-f5 p-f21 ${br ? 'border-r border-ripstop' : ''} ${bb ? 'border-b border-ripstop' : ''}`}>
      <span className={`text-[34px] font-bold leading-[42px] ${accent ? 'text-tag' : 'text-paper'}`}>{value}</span>
      <span className={`${LABEL} text-graphite`}>{label}</span>
    </div>
  );
}

interface AbandonedStation {
  name: string;
  line: string;
  closedYear: number;
  reason: string;
  canVisit: boolean;
  description: string;
}

const abandonedStations: AbandonedStation[] = [
  {
    name: "City Hall (IRT)",
    line: "6 Train Loop",
    closedYear: 1945,
    reason: "Platform too curved for modern longer trains",
    canVisit: true,
    description: "The most famous abandoned station. Features stunning Romanesque Revival architecture with Guastavino tile vaults, chandeliers, and skylights. Visible by staying on the 6 train as it loops at Brooklyn Bridge."
  },
  {
    name: "Worth Street",
    line: "6 Train",
    closedYear: 1962,
    reason: "Station too close to Brooklyn Bridge station",
    canVisit: false,
    description: "One of the original 28 stations. Platform remnants visible from passing trains between Brooklyn Bridge and Canal Street."
  },
  {
    name: "18th Street (IRT)",
    line: "6 Train",
    closedYear: 1948,
    reason: "Platform too short for longer trains",
    canVisit: false,
    description: "Original station with beautiful tilework. Platform extended at 23rd Street made this station redundant."
  },
  {
    name: "91st Street",
    line: "1/2/3 Trains",
    closedYear: 1959,
    reason: "Low ridership and platform length",
    canVisit: false,
    description: "Short platforms couldn't accommodate longer trains. Remnants visible on the downtown side."
  },
  {
    name: "Myrtle Avenue",
    line: "M Train",
    closedYear: 1969,
    reason: "Elevated line section closed",
    canVisit: false,
    description: "Part of the old BMT Jamaica Line elevated section. Station demolished along with elevated tracks."
  },
  {
    name: "Sedgwick Avenue",
    line: "9 Train (former)",
    closedYear: 1958,
    reason: "Third Avenue El discontinuation",
    canVisit: false,
    description: "Lost when the Third Avenue Elevated in the Bronx was demolished. No traces remain."
  },
];

const historicalMilestones = [
  { year: "1904", event: "First NYC Subway Opens", description: "The Interborough Rapid Transit (IRT) opens its first line from City Hall to 145th Street." },
  { year: "1913", event: "Dual Contracts Signed", description: "Massive expansion agreement leads to construction of most current subway lines." },
  { year: "1932", event: "IND Lines Open", description: "City-built Independent Subway System begins operation, completing the three-system network." },
  { year: "1940", event: "Unification", description: "City purchases all private subway companies, creating unified system under city control." },
  { year: "1953", event: "Fare Raised to 15 cents", description: "First fare increase since 1904 original 5-cent fare." },
  { year: "1968", event: "MTA Created", description: "Metropolitan Transportation Authority formed to manage regional transit." },
  { year: "1970s", event: "Graffiti Era", description: "Subway cars become canvases for graffiti artists during city fiscal crisis." },
  { year: "1984", event: "Graffiti Removal Program", description: "MTA begins systematic cleaning and prevention of graffiti." },
  { year: "2001", event: "9/11 Damage", description: "Multiple stations destroyed or damaged; Cortlandt Street station rebuilds over 17 years." },
  { year: "2017", event: "Summer of Hell", description: "Penn Station repairs cause massive service disruptions, sparking infrastructure debates." },
  { year: "2024", event: "Congestion Pricing", description: "First-in-nation congestion pricing implemented to fund transit improvements." },
];

const faqItems = [
  {
    question: "Can you visit the abandoned City Hall station?",
    answer: "Yes! The easiest way is to stay on a downtown 6 train past Brooklyn Bridge-City Hall. The train loops through the abandoned station before heading uptown. You'll see the beautiful curved platform, chandeliers, and original tilework. The NY Transit Museum also occasionally offers exclusive tours."
  },
  {
    question: "How many abandoned subway stations are there in NYC?",
    answer: "There are approximately 40 abandoned or closed stations throughout the NYC subway system. Some are completely sealed, others have visible platform remnants, and a few like City Hall remain largely intact."
  },
  {
    question: "Why were subway stations abandoned?",
    answer: "Most stations were closed because platforms were too short for modern longer trains (10-car consists). Others were victims of service changes, low ridership, or construction of nearby replacement stations."
  },
  {
    question: "What is the oldest subway station in NYC?",
    answer: "The 28 original IRT stations from 1904 are the oldest. City Hall (abandoned) and stations like Astor Place, 28th Street, and Brooklyn Bridge retain much of their original architecture."
  },
];

export default function HistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        })}
      />

      <div className="min-h-screen bg-jet font-sans text-paper">
        <SiteHeader active="history" />

        {/* ── Masthead ─────────────────────────────────────────── */}
        <section className="surface-ripstop text-paper">
          <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f34 md:px-f55 md:pb-f55 md:pt-f55">
            <div className="flex flex-col gap-f34 lg:flex-row lg:items-end lg:justify-between lg:gap-f55">
              <div className="flex min-w-0 max-w-f610 flex-col gap-f21">
                <span className={`quoted ${LABEL} text-graphite`}>History</span>
                <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                  Underground History
                </h1>
                <p className="m-0 text-[18px] leading-[29px] text-graphite [text-wrap:pretty]">
                  From the first underground train in 1904 to abandoned stations and ghost platforms,
                  explore 120 years of NYC subway history. Discover hidden tracks, closed stations,
                  and the stories buried beneath the city.
                </p>
                <div className="flex flex-wrap gap-f8 pt-f5">
                  <a href="#abandoned" className={`${LABEL} rounded-seam border border-paper bg-paper px-f13 py-f8 text-ink no-underline transition-colors hover:bg-transparent hover:text-paper`}>
                    Abandoned Stations
                  </a>
                  <a href="#timeline" className={`${LABEL} rounded-seam border border-ripstop bg-jet px-f13 py-f8 text-graphite no-underline transition-colors hover:text-paper`}>
                    Timeline
                  </a>
                  <a href="#faq" className={`${LABEL} rounded-seam border border-ripstop bg-jet px-f13 py-f8 text-graphite no-underline transition-colors hover:text-paper`}>
                    FAQ
                  </a>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 border border-ripstop">
                <Stat value="1904" label="First Line Opened" br bb />
                <Stat value="~40" label="Abandoned Stations" bb />
                <Stat value="120" label="Years of Service" br />
                <Stat value="3" label="Original Systems" accent />
              </div>
            </div>
          </div>
        </section>

        {/* zigzag rule */}
        <div aria-hidden="true" className="h-[8px]" style={{ backgroundImage: ZIGZAG, backgroundRepeat: "repeat-x" }} />

        {/* ── Abandoned Stations ───────────────────────────────── */}
        <section id="abandoned" className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
          <div className="flex flex-col gap-f21">
            <span className={`quoted ${LABEL} text-graphite`}>Ghost Stations</span>
            <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-paper">Abandoned Stations</h2>
            <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-graphite">
              Ghost stations scattered throughout the system tell stories of changing times,
              evolving technology, and the city&apos;s constant transformation.
            </p>
          </div>

          <div className="mt-f34 grid gap-f21 md:grid-cols-2">
            {abandonedStations.map((station) => (
              <div key={station.name} className="flex flex-col gap-f13 border border-ripstop bg-suede p-f21 text-paper transition-colors hover:border-graphite">
                <div className="flex items-start justify-between gap-f13">
                  <div>
                    <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">{station.name}</h3>
                    <p className={`m-0 mt-[3px] ${LABEL} text-graphite`}>{station.line}</p>
                  </div>
                  <span className={`${LABEL} shrink-0 rounded-seam border border-ripstop bg-jet px-f13 py-f5 text-muted`}>
                    Closed {station.closedYear}
                  </span>
                </div>
                <p className="m-0 text-[14px] leading-[21px] text-graphite">{station.description}</p>
                <div className="mt-auto flex items-center justify-between gap-f13 pt-f5">
                  <span className="text-[13px] leading-[21px] text-muted">
                    <span className="font-bold text-graphite">Reason:</span> {station.reason}
                  </span>
                  {station.canVisit && (
                    <span className={`${LABEL} shrink-0 rounded-seam bg-tag px-f13 py-f5 text-ink`}>
                      Visitable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Three Systems ────────────────────────────────── */}
        <section className="border-t border-ripstop bg-suede">
          <div className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
            <div className="flex flex-col gap-f13">
              <span className={`quoted ${LABEL} text-graphite`}>Divisions</span>
              <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-paper">The Three Original Systems</h2>
            </div>
            <div className="mt-f34 grid gap-f21 md:grid-cols-3">
              <div className="flex flex-col gap-f13 border border-ripstop bg-jet p-f21">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-red-600 text-[16px] font-bold text-white">
                  IRT
                </div>
                <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">Interborough Rapid Transit</h3>
                <p className="m-0 text-[14px] leading-[21px] text-graphite">
                  The original 1904 subway. Built smaller tunnels resulting in narrower cars.
                  Lines: 1, 2, 3, 4, 5, 6, 7
                </p>
                <p className={`m-0 mt-auto pt-f5 ${LABEL} text-muted`}>Opened: October 27, 1904</p>
              </div>

              <div className="flex flex-col gap-f13 border border-ripstop bg-jet p-f21">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-yellow-500 text-[16px] font-bold text-black">
                  BMT
                </div>
                <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">Brooklyn-Manhattan Transit</h3>
                <p className="m-0 text-[14px] leading-[21px] text-graphite">
                  Built with wider tunnels for larger cars. Known for Art Deco station designs.
                  Lines: B, D, F, M, N, Q, R, W, J, Z
                </p>
                <p className={`m-0 mt-auto pt-f5 ${LABEL} text-muted`}>Opened: June 22, 1908</p>
              </div>

              <div className="flex flex-col gap-f13 border border-ripstop bg-jet p-f21">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-blue-600 text-[16px] font-bold text-white">
                  IND
                </div>
                <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">Independent Subway System</h3>
                <p className="m-0 text-[14px] leading-[21px] text-graphite">
                  City-built system with the largest stations and most modern initial design.
                  Lines: A, C, E, G
                </p>
                <p className={`m-0 mt-auto pt-f5 ${LABEL} text-muted`}>Opened: September 10, 1932</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ─────────────────────────────────────────── */}
        <section id="timeline" className="mx-auto max-w-f610 px-f21 py-f34 md:px-f55 md:py-f55">
          <div className="flex flex-col gap-f13">
            <span className={`quoted ${LABEL} text-graphite`}>Timeline</span>
            <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-paper">Historical Timeline</h2>
          </div>
          <div className="mt-f34 flex flex-col gap-f21">
            {historicalMilestones.map((milestone) => (
              <div key={milestone.year} className="flex items-start gap-f21">
                <div className={`${LABEL} w-[72px] shrink-0 rounded-seam border border-ripstop bg-suede px-f8 py-f8 text-center text-paper`}>
                  {milestone.year}
                </div>
                <div className="border-l border-ripstop pb-f13 pl-f21">
                  <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">{milestone.event}</h3>
                  <p className="m-0 mt-[3px] text-[14px] leading-[21px] text-graphite">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="border-t border-ripstop bg-suede">
          <div className="mx-auto max-w-f610 px-f21 py-f34 md:px-f55 md:py-f55">
            <div className="flex flex-col gap-f13">
              <span className={`quoted ${LABEL} text-graphite`}>FAQ</span>
              <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-paper">Frequently Asked Questions</h2>
            </div>
            <div className="mt-f34 flex flex-col gap-f13">
              {faqItems.map((faq, index) => (
                <div key={index} className="border border-ripstop bg-jet p-f21">
                  <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">{faq.question}</h3>
                  <p className="m-0 mt-f8 text-[14px] leading-[21px] text-graphite">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Links ────────────────────────────────────── */}
        <section className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
          <div className="flex flex-col gap-f13">
            <span className={`quoted ${LABEL} text-graphite`}>Explore</span>
            <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-paper">Explore More</h2>
          </div>
          <div className="mt-f34 grid gap-f21 md:grid-cols-3">
            <a href="/operations" className="group flex flex-col gap-f8 border border-ripstop bg-suede p-f21 no-underline transition-colors hover:border-graphite">
              <span className={`quoted ${LABEL} text-graphite`}>Operations</span>
              <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">How It Works</h3>
              <p className="m-0 text-[14px] leading-[21px] text-graphite">Learn about signals, dispatching, and subway operations</p>
            </a>
            <a href="/culture" className="group flex flex-col gap-f8 border border-ripstop bg-suede p-f21 no-underline transition-colors hover:border-graphite">
              <span className={`quoted ${LABEL} text-graphite`}>Culture</span>
              <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">Subway Culture</h3>
              <p className="m-0 text-[14px] leading-[21px] text-graphite">Movies, music, and art inspired by the subway</p>
            </a>
            <a href="/subway-map" className="group flex flex-col gap-f8 border border-ripstop bg-suede p-f21 no-underline transition-colors hover:border-graphite">
              <span className={`quoted ${LABEL} text-graphite`}>Map</span>
              <h3 className="m-0 text-[18px] font-bold leading-[24px] text-paper">Interactive Map</h3>
              <p className="m-0 text-[14px] leading-[21px] text-graphite">Explore today&apos;s subway system in real-time</p>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
