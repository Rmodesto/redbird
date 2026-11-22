import { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";
import { generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = generateSEOMetadata({
  title: 'How NYC Subway Works - Operations, Signals & Technology',
  description: 'Discover how the NYC subway system operates. Learn about signal systems, CBTC technology, train dispatching, and why the subway runs 24/7.',
  keywords: [
    'nyc subway operations',
    'mta signal system',
    'cbtc subway',
    'subway technology',
    'how nyc subway works',
    'subway dispatching',
    'mta train control',
    'subway signal explained',
    'why nyc subway runs 24/7',
    'l train cbtc',
  ],
  canonical: '/operations',
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Operations", url: "/operations" },
]);

interface OperationsTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const operationsTopics: OperationsTopic[] = [
  {
    id: "dispatching",
    title: "Train Dispatching",
    description: "How trains are controlled and coordinated across 472 stations.",
    icon: "🎮",
    details: [
      "Rail Control Center monitors all train movements 24/7",
      "Train dispatchers coordinate departures from terminals",
      "Real-time communication with train operators via radio",
      "Automatic announcements triggered by location beacons",
    ]
  },
  {
    id: "signals",
    title: "Signal Systems",
    description: "The technology that keeps trains from colliding.",
    icon: "🚦",
    details: [
      "Fixed-block signals divide tracks into protected sections",
      "Red, yellow, and green aspects control train speeds",
      "Interlocking systems prevent conflicting routes",
      "Trip arms physically stop trains that run red signals",
    ]
  },
  {
    id: "cbtc",
    title: "CBTC Technology",
    description: "Communications-Based Train Control modernizing the subway.",
    icon: "📡",
    details: [
      "L train fully converted to CBTC in 2019",
      "Allows trains to run closer together safely",
      "Increases line capacity by 10-15%",
      "7 line CBTC implementation underway",
    ]
  },
  {
    id: "24-7",
    title: "24/7 Operations",
    description: "Why NYC is one of the few subways that never sleeps.",
    icon: "🌙",
    details: [
      "Only major subway system running continuous service",
      "Night ridership exceeds 100,000 passengers",
      "Essential for late-night workers and early commuters",
      "Maintenance done on alternate tracks or weekends",
    ]
  },
  {
    id: "maintenance",
    title: "Night Maintenance",
    description: "How crews repair tracks while the subway runs.",
    icon: "🔧",
    details: [
      "Track workers operate between 1 AM and 5 AM",
      "Reduced service allows single-tracking",
      "Weekend shutdowns for major repairs",
      "Annual FASTRACK program for accelerated work",
    ]
  },
  {
    id: "power",
    title: "Power Systems",
    description: "The electrical infrastructure powering 6,400+ cars.",
    icon: "⚡",
    details: [
      "600-volt DC third rail provides traction power",
      "53 substations convert AC to DC power",
      "Regenerative braking returns energy to the grid",
      "Power failures managed through redundant feeds",
    ]
  },
];

const faqItems = [
  {
    question: "Why does NYC subway run 24 hours?",
    answer: "NYC subway operates 24/7 primarily because New York is a city that never sleeps. The system serves essential workers, late-night employees, and early morning commuters. Unlike cities with residential suburbs, NYC has significant late-night activity requiring continuous transit service."
  },
  {
    question: "What is CBTC and which lines have it?",
    answer: "CBTC (Communications-Based Train Control) is a modern signaling system that uses continuous radio communication between trains and wayside equipment. Currently, the L train is fully CBTC-equipped. The 7 line is being converted, and future plans include the A/C/E lines."
  },
  {
    question: "How do subway signals work?",
    answer: "NYC subway uses a fixed-block signal system dating to the early 1900s. Tracks are divided into blocks, and signals show red (stop), yellow (caution), or green (proceed) based on occupancy. Trip arms near signals physically stop trains that run red lights."
  },
  {
    question: "How are subway schedules created?",
    answer: "Schedules are created by the MTA's Operations Planning division using historical ridership data, maintenance windows, and crew availability. Timetables are adjusted seasonally and for special events. Real-time adjustments happen at the Rail Control Center."
  },
];

export default function OperationsPage() {
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
              How NYC Subway Works
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl">
              Discover the technology, operations, and systems that keep 5.5 million daily riders moving through
              the largest rapid transit system in North America. From century-old signals to cutting-edge CBTC.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#signals" className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Signal Systems
              </a>
              <a href="#cbtc" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                CBTC Technology
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
                <div className="text-3xl font-bold text-black">24/7</div>
                <div className="text-sm text-gray-600">Hours of Operation</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">6,418</div>
                <div className="text-sm text-gray-600">Subway Cars</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">245</div>
                <div className="text-sm text-gray-600">Miles of Track</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-3xl font-bold text-black">53</div>
                <div className="text-sm text-gray-600">Power Substations</div>
              </div>
            </div>
          </div>
        </section>

        {/* Operations Topics */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Key Operations Systems</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operationsTopics.map((topic) => (
                <div key={topic.id} id={topic.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <ul className="space-y-2">
                    {topic.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">&#10003;</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signal Evolution Timeline */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Evolution of Subway Signals</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {[
                  { year: "1904", title: "Original Signal System", desc: "Electro-mechanical fixed-block signals installed with the first subway" },
                  { year: "1920s", title: "Automatic Block Signals", desc: "Expanded automatic train stop protection across the system" },
                  { year: "1950s", title: "Interlocking Modernization", desc: "Relay-based interlocking machines replace mechanical systems" },
                  { year: "1999", title: "CBTC Pilot", desc: "First CBTC testing begins on the L train Canarsie Line" },
                  { year: "2019", title: "L Train CBTC Complete", desc: "Full CBTC operation on the L train, first line converted" },
                  { year: "2025+", title: "System-Wide Modernization", desc: "Planned CBTC expansion to A/C/E and other lines" },
                ].map((item) => (
                  <div key={item.year} className="flex gap-6 items-start">
                    <div className="bg-black text-white px-4 py-2 rounded font-bold shrink-0">
                      {item.year}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
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
              <a href="/subway-map" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#128506;</div>
                <h3 className="font-bold text-lg mb-2">Interactive Map</h3>
                <p className="text-gray-300 text-sm">See all lines and stations on our real-time subway map</p>
              </a>
              <a href="/lines" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#128646;</div>
                <h3 className="font-bold text-lg mb-2">Subway Lines</h3>
                <p className="text-gray-300 text-sm">Detailed information for each of the 27 subway lines</p>
              </a>
              <a href="/history" className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition">
                <div className="text-2xl mb-2">&#128218;</div>
                <h3 className="font-bold text-lg mb-2">Subway History</h3>
                <p className="text-gray-300 text-sm">Abandoned stations and hidden tracks of NYC</p>
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
