import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { generateMapSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";
import dynamic from 'next/dynamic';

// Dynamically import the working map component to avoid SSR issues
const SubwayMap = dynamic(
  () => import('@/components/WorkingSubwayMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4 animate-pulse">🗽</div>
          <div className="text-xl font-bold mb-2">Loading NYC Subway Map...</div>
          <div className="text-sm text-gray-400">Initializing real-time data</div>
        </div>
      </div>
    )
  }
);

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Map - Interactive Real-Time Transit Map | Subway Sounds",
  "Navigate NYC with our interactive subway map featuring all lines, stations, real-time arrivals, and service alerts. Plan your journey with the most comprehensive NYC subway map.",
  [
    "NYC subway map interactive",
    "MTA map real-time",
    "New York metro map",
    "subway route planner",
    "train map NYC",
    "transit map Manhattan",
    "Brooklyn subway map",
    "Queens train map",
    "Bronx metro map",
    "live subway map",
  ]
);

const mapSchema = generateMapSchema();
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Subway Map", url: "/subway-map" },
]);

export default function SubwayMapPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(mapSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section with SEO-optimized content */}
        <section className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              NYC Subway Map - Interactive Real-Time Transit Guide
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Explore New York City's complete subway system with our interactive map. 
              View all 472 stations, 27 lines, real-time train arrivals, and service updates.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                View Full Screen Map
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats for SEO */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">472</div>
                <div className="text-sm text-gray-600">Stations</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">27</div>
                <div className="text-sm text-gray-600">Lines</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">245</div>
                <div className="text-sm text-gray-600">Miles of Track</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">5M+</div>
                <div className="text-sm text-gray-600">Daily Riders</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Map Container */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg" style={{ height: '600px' }}>
              <div className="h-full relative">
                <div className="w-full h-full">
                  <SubwayMap />
                </div>
                
                {/* Map Overlay Info */}
                <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="font-semibold">Live NYC Subway Map</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    Click stations for details • Drag to explore • Scroll to zoom
                  </div>
                </div>
                
                {/* Map Controls Info */}
                <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs">
                  <div className="font-semibold mb-1">Controls</div>
                  <div>🖱️ Click & drag to pan</div>
                  <div>🔍 Scroll to zoom</div>
                  <div>📍 Click stations for info</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Legend */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Subway Lines Guide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { lines: ['1', '2', '3'], color: 'bg-red-600', name: 'Broadway-7th Ave' },
                { lines: ['4', '5', '6'], color: 'bg-green-600', name: 'Lexington Ave' },
                { lines: ['7'], color: 'bg-purple-600', name: 'Flushing' },
                { lines: ['A', 'C', 'E'], color: 'bg-blue-600', name: '8th Ave' },
                { lines: ['B', 'D', 'F', 'M'], color: 'bg-orange-500', name: '6th Ave' },
                { lines: ['N', 'Q', 'R', 'W'], color: 'bg-yellow-500', name: 'Broadway' },
                { lines: ['J', 'Z'], color: 'bg-amber-600', name: 'Nassau St' },
                { lines: ['L'], color: 'bg-gray-500', name: '14th St-Canarsie' },
                { lines: ['G'], color: 'bg-green-500', name: 'Crosstown' },
                { lines: ['S'], color: 'bg-gray-600', name: 'Shuttles' },
              ].map((line) => (
                <div key={line.name} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    {line.lines.map((l) => (
                      <div
                        key={l}
                        className={`${line.color} text-white w-6 h-6 rounded text-xs font-bold flex items-center justify-center mr-1`}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">{line.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content Sections */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 prose prose-lg">
            <h2 className="text-3xl font-bold mb-6">Navigate NYC with Our Comprehensive Subway Map</h2>
            <p className="text-gray-700 mb-4">
              The New York City Subway map is your essential guide to navigating the largest rapid transit system in North America. 
              Our interactive subway map provides real-time updates on all 27 lines serving Manhattan, Brooklyn, Queens, and the Bronx.
            </p>
            
            <h3 className="text-2xl font-bold mt-8 mb-4">How to Use the NYC Subway Map</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Click on any station to view real-time arrivals and platform information</li>
              <li>Use the search bar to quickly find stations or addresses</li>
              <li>Toggle between standard and accessible station views</li>
              <li>View service alerts and planned work affecting your journey</li>
              <li>Plan routes with our integrated trip planner</li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">Subway Map Features</h3>
            <div className="grid md:grid-cols-2 gap-6 my-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Real-Time Updates</h4>
                <p className="text-gray-700 text-sm">Live train positions and arrival times updated every 30 seconds</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Accessibility Info</h4>
                <p className="text-gray-700 text-sm">Elevator and escalator status at all ADA-accessible stations</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Service Alerts</h4>
                <p className="text-gray-700 text-sm">Real-time service changes, delays, and weekend work</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Multi-Language</h4>
                <p className="text-gray-700 text-sm">Map available in English, Spanish, Chinese, and more</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4">Popular Subway Routes</h3>
            <p className="text-gray-700 mb-4">
              Whether you're commuting to work or exploring NYC's attractions, our subway map helps you navigate popular routes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Times Square to Grand Central:</strong> Take the S shuttle for direct service</li>
              <li><strong>Manhattan to JFK Airport:</strong> A train to Howard Beach, then AirTrain</li>
              <li><strong>Brooklyn to Manhattan:</strong> Multiple options via 4/5/6, N/Q/R/W, or L trains</li>
              <li><strong>Upper East to Upper West Side:</strong> Cross at 59th St or Times Square</li>
            </ul>
          </div>
        </section>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <a href="/" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🏠</span>
              HOME
            </a>
            <a href="/lines" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🚇</span>
              LINES
            </a>
            <a href="/stations" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">📍</span>
              STATIONS
            </a>
            <a href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-black">
              <span className="text-lg mb-1">🗺️</span>
              MAP
            </a>
            <a href="/subway-sounds" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🔊</span>
              SOUNDS
            </a>
          </div>
        </div>
      </div>
    </>
  );
}