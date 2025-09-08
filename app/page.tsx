import { Metadata } from "next";
import Link from "next/link";
import { generateSEOMetadata, generateFAQSchema } from "@/lib/seo";
import { generateCollectionPageSchema, generateStructuredDataScript } from "@/lib/structured-data";
import StationSearch from "@/components/StationSearch";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = generateSEOMetadata({
  title: "Subway Sounds NYC - Real-Time NYC Subway Directory, Map & Train Arrivals",
  description: "Navigate NYC subway with real-time train arrivals, interactive subway map, station sounds, and comprehensive directory. Track all 27 lines across 472 stations in Manhattan, Brooklyn, Queens & Bronx.",
  keywords: [
    "NYC subway real-time",
    "subway sounds New York",
    "MTA train tracker",
    "NYC metro map interactive",
    "subway station finder",
    "train arrivals NYC live",
    "Manhattan subway guide",
    "Brooklyn train stations",
    "Queens subway map",
    "Bronx metro stations",
  ],
  canonical: "/",
});

// MTA line colors mapping
const subwayLines = [
  { id: "1", name: "1", color: "bg-red-600", textColor: "text-white" },
  { id: "2", name: "2", color: "bg-red-600", textColor: "text-white" },
  { id: "3", name: "3", color: "bg-red-600", textColor: "text-white" },
  { id: "4", name: "4", color: "bg-green-600", textColor: "text-white" },
  { id: "5", name: "5", color: "bg-green-600", textColor: "text-white" },
  { id: "6", name: "6", color: "bg-green-600", textColor: "text-white" },
  { id: "7", name: "7", color: "bg-purple-600", textColor: "text-white" },
  { id: "A", name: "A", color: "bg-blue-600", textColor: "text-white" },
  { id: "B", name: "B", color: "bg-orange-500", textColor: "text-white" },
  { id: "C", name: "C", color: "bg-blue-600", textColor: "text-white" },
  { id: "D", name: "D", color: "bg-orange-500", textColor: "text-white" },
  { id: "E", name: "E", color: "bg-blue-600", textColor: "text-white" },
  { id: "F", name: "F", color: "bg-orange-500", textColor: "text-white" },
  { id: "G", name: "G", color: "bg-green-500", textColor: "text-white" },
  { id: "J", name: "J", color: "bg-amber-600", textColor: "text-white" },
  { id: "L", name: "L", color: "bg-gray-500", textColor: "text-white" },
  { id: "M", name: "M", color: "bg-orange-500", textColor: "text-white" },
  { id: "N", name: "N", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Q", name: "Q", color: "bg-yellow-500", textColor: "text-black" },
  { id: "R", name: "R", color: "bg-yellow-500", textColor: "text-black" },
  { id: "S", name: "S", color: "bg-gray-600", textColor: "text-white" },
  { id: "W", name: "W", color: "bg-yellow-500", textColor: "text-black" },
  { id: "Z", name: "Z", color: "bg-amber-600", textColor: "text-white" },
];

// Generate structured data
const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Directory",
  "Complete directory of New York City subway stations with real-time arrivals",
  "stations",
  472
);

const faqSchema = generateFAQSchema([
  {
    question: "How do I track real-time NYC subway arrivals?",
    answer: "Use our station search to find any NYC subway station and view real-time train arrivals updated every 30 seconds directly from MTA data feeds."
  },
  {
    question: "What are NYC subway sounds?",
    answer: "NYC subway sounds include platform announcements, door chimes, train arrivals, and station ambiance. Our archive features authentic recordings from all 472 stations."
  },
  {
    question: "How many subway lines are in NYC?",
    answer: "The NYC subway system has 27 lines (including shuttles) operating across 472 stations in Manhattan, Brooklyn, Queens, and the Bronx."
  },
  {
    question: "Where can I find an interactive NYC subway map?",
    answer: "Our interactive subway map shows all lines, stations, and real-time service updates. Click on any station for arrivals and platform information."
  }
]);

export default function HomePage() {
  const serviceAlerts = [
    {
      type: "delay",
      icon: "🕐",
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      message: "DELAYS on 5 Train - Signal Problems at 125 St"
    },
    {
      type: "service_change",
      icon: "⚠️",
      color: "text-red-600 bg-red-50 border-red-200",
      message: "Weekend Service: 2 Train running on 5 line in Brooklyn"
    },
  ];

  const popularStations = [
    { name: "Times Square-42 St", lines: ["N", "Q", "R", "W", "S", "1", "2", "3", "7"], slug: "times-square-42-st" },
    { name: "Grand Central-42 St", lines: ["4", "5", "6", "7", "S"], slug: "grand-central-42-st" },
    { name: "Union Square-14 St", lines: ["4", "5", "6", "N", "Q", "R", "W", "L"], slug: "union-square-14-st" },
    { name: "Herald Square", lines: ["B", "D", "F", "M", "N", "Q", "R", "W"], slug: "herald-square" },
    { name: "Fulton St", lines: ["2", "3", "4", "5", "A", "C", "J", "Z"], slug: "fulton-st" },
    { name: "Atlantic Ave", lines: ["B", "Q", "D", "N", "R", "W", "2", "3", "4", "5"], slug: "atlantic-ave-barclays" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(faqSchema)}
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section with Search */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              NYC Subway Sounds & Real-Time Directory
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Track trains in real-time, explore subway sounds, and navigate all 472 stations across New York City
            </p>
            
            {/* Station Search */}
            <div className="max-w-2xl">
              <StationSearch />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/subway-map" className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                🗺️ Interactive Map
              </Link>
              <Link href="/subway-sounds" className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">
                🔊 Subway Sounds
              </Link>
              <Link href="/real-time" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                ⏱️ Live Arrivals
              </Link>
            </div>
          </div>
        </section>

        {/* Service Alerts */}
        <section className="py-4 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500 animate-pulse">●</span>
              <h2 className="font-semibold">Live Service Updates</h2>
            </div>
            <div className="space-y-2">
              {serviceAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${alert.color}`}>
                  <span className="mr-2">{alert.icon}</span>
                  <span className="font-medium">{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Subway Lines */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">All NYC Subway Lines</h2>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
              {subwayLines.map((line) => (
                <Link
                  key={line.id}
                  href={`/line/${line.id.toLowerCase()}`}
                  className={`${line.color} ${line.textColor} h-12 rounded-lg font-bold text-xl flex items-center justify-center hover:scale-110 transition-transform`}
                  aria-label={`${line.name} train line information`}
                >
                  {line.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Stations */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Popular NYC Subway Stations</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularStations.map((station) => (
                <Link
                  key={station.slug}
                  href={`/station/${station.slug}`}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition border"
                >
                  <h3 className="text-xl font-bold mb-3">{station.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {station.lines.map((lineId) => {
                      const line = subwayLines.find(l => l.id === lineId);
                      return line ? (
                        <div
                          key={lineId}
                          className={`${line.color} ${line.textColor} w-8 h-8 rounded text-sm font-bold flex items-center justify-center`}
                          aria-label={`${lineId} train`}
                        >
                          {lineId}
                        </div>
                      ) : null;
                    })}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/stations" className="text-blue-600 hover:text-blue-800 font-semibold">
                View All 472 Stations →
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Explore NYC Subway</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="text-3xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold mb-2">Interactive Subway Map</h3>
                <p className="text-gray-700 mb-4">Navigate all 27 lines with our real-time interactive map showing live train positions and service alerts.</p>
                <Link href="/subway-map" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Open Map →
                </Link>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                <div className="text-3xl mb-4">🔊</div>
                <h3 className="text-xl font-bold mb-2">Subway Sounds Archive</h3>
                <p className="text-gray-700 mb-4">Listen to authentic NYC subway sounds including announcements, door chimes, and station ambiance.</p>
                <Link href="/subway-sounds" className="text-yellow-700 hover:text-yellow-900 font-semibold">
                  Listen Now →
                </Link>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                <div className="text-3xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold mb-2">Real-Time Arrivals</h3>
                <p className="text-gray-700 mb-4">Track live train arrivals at any station with updates every 30 seconds from official MTA feeds.</p>
                <Link href="/real-time" className="text-green-700 hover:text-green-900 font-semibold">
                  Track Trains →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Your Complete NYC Subway Guide</h2>
            <div className="prose prose-lg text-gray-700">
              <p>
                Navigate the New York City Subway system with confidence using our comprehensive directory. 
                With <strong>472 stations</strong> across <strong>27 lines</strong> spanning Manhattan, Brooklyn, 
                Queens, and the Bronx, the NYC subway is one of the world&apos;s largest rapid transit systems.
              </p>
              
              <h3 className="text-2xl font-bold mt-6 mb-3">Real-Time Train Tracking</h3>
              <p>
                Our platform provides live train arrivals updated every 30 seconds directly from MTA data feeds. 
                Track any train, view platform-specific arrivals, and get instant service alerts for delays and changes.
              </p>
              
              <h3 className="text-2xl font-bold mt-6 mb-3">Authentic Subway Sounds</h3>
              <p>
                Experience the unique acoustic signature of NYC&apos;s underground with our extensive subway sounds archive. 
                From the iconic &quot;stand clear of the closing doors&quot; announcement to the rumble of approaching trains, 
                we&apos;ve captured the authentic sounds that define New York&apos;s transit experience.
              </p>
              
              <h3 className="text-2xl font-bold mt-6 mb-3">Interactive Subway Map</h3>
              <p>
                Our interactive map makes journey planning simple. Click any station for detailed information, 
                view real-time train positions, check accessibility features, and discover nearby attractions. 
                Whether you&apos;re a daily commuter or first-time visitor, our map helps you navigate NYC like a local.
              </p>
            </div>
          </div>
        </section>

        {/* System Stats */}
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-black">472</div>
                <div className="text-gray-600">Stations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black">27</div>
                <div className="text-gray-600">Lines</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black">5M+</div>
                <div className="text-gray-600">Daily Riders</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-black">24/7</div>
                <div className="text-gray-600">Service</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-xs font-medium text-black">
              <span className="text-lg mb-1">🏠</span>
              HOME
            </Link>
            <Link href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🚇</span>
              LINES
            </Link>
            <Link href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">📍</span>
              STATIONS
            </Link>
            <Link href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🗺️</span>
              MAP
            </Link>
            <Link href="/subway-sounds" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🔊</span>
              SOUNDS
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}