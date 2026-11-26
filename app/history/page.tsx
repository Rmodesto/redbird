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

const originalSystems = [
  {
    tag: "IRT",
    title: "Interborough Rapid Transit",
    body: "The original 1904 subway. Built smaller tunnels resulting in narrower cars. Lines: 1, 2, 3, 4, 5, 6, 7",
    opened: "Opened: October 27, 1904",
  },
  {
    tag: "BMT",
    title: "Brooklyn-Manhattan Transit",
    body: "Built with wider tunnels for larger cars. Known for Art Deco station designs. Lines: B, D, F, M, N, Q, R, W, J, Z",
    opened: "Opened: June 22, 1908",
  },
  {
    tag: "IND",
    title: "Independent Subway System",
    body: "City-built system with the largest stations and most modern initial design. Lines: A, C, E, G",
    opened: "Opened: September 10, 1932",
  },
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

const relatedLinks = [
  { href: "/operations", tag: "Operations", title: "How It Works", body: "Learn about signals, dispatching, and subway operations" },
  { href: "/culture", tag: "Culture", title: "Subway Culture", body: "Movies, music, and art inspired by the subway" },
  { href: "/subway-map", tag: "Map", title: "Interactive Map", body: "Explore today's subway system in real-time" },
];

/* Section header: quoted eyebrow + mega-sub h2, the body's recurring opener. */
function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-f8">
      <span className={`quoted ${LABEL} text-muted`}>{eyebrow}</span>
      <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-ink">{title}</h2>
    </div>
  );
}

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
          <div className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f89">
            <div className="grid items-end gap-f34 lg:grid-cols-golden lg:gap-f89">
              <div className="flex min-w-0 flex-col gap-f21">
                <span className={`quoted ${LABEL} text-graphite`}>History</span>
                <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                  Underground History
                </h1>
                <p className="m-0 max-w-f610 text-[18px] leading-[29px] text-paper [text-wrap:pretty]">
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

              <a
                href="#abandoned"
                className="flex flex-col gap-f8 border border-[rgba(255,255,255,0.18)] bg-smoke p-f21 text-paper no-underline backdrop-blur-smoke lg:justify-self-end lg:self-end"
              >
                <span className={`quoted ${LABEL}`}>Rare Topic</span>
                <span className="text-[21px] font-bold leading-[26px]">Abandoned subway stations of NYC</span>
                <span className={`${LABEL}`}>Read &rarr;</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Body: white paper card ───────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-f21 pb-f55 md:px-f55 md:pb-f89">
          <main className="panel flex flex-col gap-f55 bg-paper p-f21 text-ink md:gap-f89 md:p-f55 lg:p-f89">

            {/* Timeline */}
            <section id="timeline" className="flex flex-col gap-f34">
              <SectionHead eyebrow="Timeline" title="The subway, decade by decade" />
              <div className="border-t border-ink">
                {historicalMilestones.map((m) => (
                  <div
                    key={m.year}
                    className="grid grid-cols-1 gap-f8 border-b border-seam py-f21 md:grid-cols-[144px_minmax(0,1fr)] md:items-baseline md:gap-f34 md:py-f34"
                  >
                    <span className="text-[34px] font-bold leading-[42px] text-ink [font-variant-numeric:tabular-nums]">{m.year}</span>
                    <div className="flex flex-col gap-f8">
                      <span className="text-[21px] font-bold leading-[26px] text-ink">{m.event}</span>
                      <span className="text-[16px] leading-[26px] text-muted">{m.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Abandoned Stations */}
            <section id="abandoned" className="flex flex-col gap-f34">
              <SectionHead eyebrow="Ghost Stations" title="Abandoned Stations" />
              <div className="grid gap-x-f34 gap-y-f55 md:grid-cols-2 lg:grid-cols-3">
                {abandonedStations.map((station) => (
                  <div key={station.name} className="flex flex-col gap-f13 border-t-[3px] border-ink pt-f21">
                    <div className="flex items-start justify-between gap-f13">
                      <span className={`quoted ${LABEL} text-muted`}>{station.line}</span>
                      <span className={`${LABEL} shrink-0 text-muted`}>Closed {station.closedYear}</span>
                    </div>
                    <span className="text-[26px] font-bold leading-[34px] text-ink">{station.name}</span>
                    <span className="text-[16px] leading-[26px] text-muted">{station.description}</span>
                    <span className="text-[13px] leading-[21px] text-muted">
                      <span className="font-bold text-ink">Reason:</span> {station.reason}
                    </span>
                    {station.canVisit && (
                      <span className={`${LABEL} w-fit bg-tag px-f13 py-f5 text-ink`}>Visitable</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* The Three Original Systems */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Divisions" title="The Three Original Systems" />
              <div className="grid gap-x-f34 gap-y-f55 md:grid-cols-3">
                {originalSystems.map((sys) => (
                  <div key={sys.tag} className="flex flex-col gap-f13 border-t-[3px] border-ink pt-f21">
                    <span className={`quoted ${LABEL} text-muted`}>{sys.tag}</span>
                    <span className="text-[26px] font-bold leading-[34px] text-ink">{sys.title}</span>
                    <span className="text-[16px] leading-[26px] text-muted">{sys.body}</span>
                    <span className={`mt-auto pt-f5 ${LABEL} text-muted`}>{sys.opened}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="flex flex-col gap-f34">
              <SectionHead eyebrow="FAQ" title="Frequently Asked Questions" />
              <div className="border-t border-ink">
                {faqItems.map((faq) => (
                  <div key={faq.question} className="flex flex-col gap-f8 border-b border-seam py-f21 md:py-f34">
                    <h3 className="m-0 text-[21px] font-bold leading-[26px] text-ink">{faq.question}</h3>
                    <p className="m-0 text-[16px] leading-[26px] text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Explore More */}
            <section className="flex flex-col gap-f34">
              <SectionHead eyebrow="Explore" title="Explore More" />
              <div className="grid gap-x-f34 gap-y-f55 md:grid-cols-3">
                {relatedLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col gap-f13 border-t-[3px] border-ink pt-f21 text-ink no-underline"
                  >
                    <span className={`quoted ${LABEL} text-muted`}>{link.tag}</span>
                    <span className="text-[26px] font-bold leading-[34px] text-ink transition-colors group-hover:text-muted">{link.title}</span>
                    <span className="text-[16px] leading-[26px] text-muted">{link.body}</span>
                  </a>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  );
}
