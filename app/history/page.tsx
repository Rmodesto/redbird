import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";
import { generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";

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

      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Hero Section */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              NYC Subway History
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl">
              From the first underground train in 1904 to abandoned stations and ghost platforms,
              explore 120 years of NYC subway history. Discover hidden tracks, closed stations,
              and the stories buried beneath the city.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#abandoned" className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Abandoned Stations
              </a>
              <a href="#timeline" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                Timeline
              </a>
              <a href="#faq" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                FAQ
              </a>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">1904</div>
                <div className="text-sm text-gray-600">First Line Opened</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">~40</div>
                <div className="text-sm text-gray-600">Abandoned Stations</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">120</div>
                <div className="text-sm text-gray-600">Years of Service</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">3</div>
                <div className="text-sm text-gray-600">Original Systems</div>
              </div>
            </div>
          </div>
        </section>

        {/* Abandoned Stations */}
        <section id="abandoned" className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Abandoned Stations</h2>
            <p className="text-gray-600 mb-8 max-w-3xl">
              Ghost stations scattered throughout the system tell stories of changing times,
              evolving technology, and the city&apos;s constant transformation.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {abandonedStations.map((station) => (
                <div key={station.name} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{station.name}</h3>
                      <p className="text-gray-500 text-sm">{station.line}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                        Closed {station.closedYear}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{station.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      <strong>Reason:</strong> {station.reason}
                    </span>
                    {station.canVisit && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium">
                        Visitable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Three Systems */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">The Three Original Systems</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  IRT
                </div>
                <h3 className="text-xl font-bold mb-2">Interborough Rapid Transit</h3>
                <p className="text-gray-600 mb-4">
                  The original 1904 subway. Built smaller tunnels resulting in narrower cars.
                  Lines: 1, 2, 3, 4, 5, 6, 7
                </p>
                <p className="text-sm text-gray-500">Opened: October 27, 1904</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xl mb-4">
                  BMT
                </div>
                <h3 className="text-xl font-bold mb-2">Brooklyn-Manhattan Transit</h3>
                <p className="text-gray-600 mb-4">
                  Built with wider tunnels for larger cars. Known for Art Deco station designs.
                  Lines: B, D, F, M, N, Q, R, W, J, Z
                </p>
                <p className="text-sm text-gray-500">Opened: June 22, 1908</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  IND
                </div>
                <h3 className="text-xl font-bold mb-2">Independent Subway System</h3>
                <p className="text-gray-600 mb-4">
                  City-built system with the largest stations and most modern initial design.
                  Lines: A, C, E, G
                </p>
                <p className="text-sm text-gray-500">Opened: September 10, 1932</p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section id="timeline" className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Historical Timeline</h2>
            <div className="space-y-6">
              {historicalMilestones.map((milestone) => (
                <div key={milestone.year} className="flex gap-6 items-start">
                  <div className="bg-black text-white px-4 py-2 rounded font-bold shrink-0 w-20 text-center">
                    {milestone.year}
                  </div>
                  <div className="border-l-2 border-gray-200 pl-6 pb-6">
                    <h3 className="font-bold text-lg">{milestone.event}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Explore More</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <a href="/operations" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#9881;</div>
                <h3 className="font-bold text-lg mb-2">How It Works</h3>
                <p className="text-gray-300 text-sm">Learn about signals, dispatching, and subway operations</p>
              </a>
              <a href="/culture" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#127917;</div>
                <h3 className="font-bold text-lg mb-2">Subway Culture</h3>
                <p className="text-gray-300 text-sm">Movies, music, and art inspired by the subway</p>
              </a>
              <a href="/subway-map" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#128506;</div>
                <h3 className="font-bold text-lg mb-2">Interactive Map</h3>
                <p className="text-gray-300 text-sm">Explore today&apos;s subway system in real-time</p>
              </a>
            </div>
          </div>
        </section>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <a href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">&#127968;</span>
              HOME
            </a>
            <a href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">&#128647;</span>
              LINES
            </a>
            <a href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">&#128205;</span>
              STATIONS
            </a>
            <a href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">&#128506;</span>
              MAP
            </a>
            <a href="/subway-sounds" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">&#128266;</span>
              SOUNDS
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
