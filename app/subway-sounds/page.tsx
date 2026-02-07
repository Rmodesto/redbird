import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { generateCollectionPageSchema, generateAudioSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Sounds - Platform Announcements & Train Audio Archive",
  "Experience authentic NYC subway sounds including platform announcements, train arrivals, door chimes, and station ambiance. The most comprehensive collection of New York subway audio.",
  [
    "subway sounds NYC",
    "train platform sounds",
    "MTA announcements audio",
    "subway door chime",
    "New York metro sounds",
    "train arrival sounds",
    "subway station ambiance",
    "NYC transit audio",
    "subway platform announcements",
    "train sounds recording",
  ]
);

const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Sounds Archive",
  "Comprehensive collection of authentic NYC subway sounds and announcements",
  "stations",
  50
);

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Subway Sounds", url: "/subway-sounds" },
]);

// Sample audio for structured data
const sampleAudioSchema = generateAudioSchema(
  "Times Square Station Announcement",
  "Stand clear of the closing doors please - Times Square 42nd Street station announcement",
  "/sounds/times-square-announcement.mp3",
  "PT30S"
);

export default function SubwaySoundsPage() {
  // Sound categories for organization
  const soundCategories = [
    {
      name: "Platform Announcements",
      icon: "📢",
      sounds: [
        { name: "Stand Clear of Closing Doors", duration: "0:03", plays: "125K" },
        { name: "Next Stop Announcement", duration: "0:08", plays: "98K" },
        { name: "Service Change Alert", duration: "0:15", plays: "76K" },
        { name: "Last Stop - All Passengers Must Exit", duration: "0:06", plays: "65K" },
      ]
    },
    {
      name: "Train Sounds",
      icon: "🚊",
      sounds: [
        { name: "Train Arriving at Platform", duration: "0:12", plays: "145K" },
        { name: "Express Train Passing", duration: "0:08", plays: "112K" },
        { name: "Train Departing Station", duration: "0:10", plays: "89K" },
        { name: "Underground Train Echo", duration: "0:15", plays: "67K" },
      ]
    },
    {
      name: "Station Ambiance",
      icon: "🎵",
      sounds: [
        { name: "Times Square Rush Hour", duration: "1:30", plays: "203K" },
        { name: "Grand Central Terminal", duration: "2:00", plays: "187K" },
        { name: "Union Square Morning", duration: "1:45", plays: "156K" },
        { name: "Brooklyn Bridge Evening", duration: "1:20", plays: "134K" },
      ]
    },
    {
      name: "Classic Sounds",
      icon: "🎼",
      sounds: [
        { name: "Vintage R32 Door Chime", duration: "0:02", plays: "234K" },
        { name: "Old Token Turnstile", duration: "0:03", plays: "198K" },
        { name: "1980s Conductor Call", duration: "0:05", plays: "167K" },
        { name: "Classic 'Bing-Bong' Alert", duration: "0:02", plays: "145K" },
      ]
    },
  ];

  const popularStations = [
    { name: "Times Square-42 St", slug: "times-sq-42-st" },
    { name: "Grand Central-42 St", slug: "grand-central-42-st" },
    { name: "Union Square-14 St", slug: "14-st-union-sq" },
    { name: "34 St-Herald Sq", slug: "34-st-herald-sq" },
    { name: "Fulton St", slug: "fulton-st-2345acjz" },
    { name: "Atlantic Av-Barclays Ctr", slug: "atlantic-av-barclays-ctr" },
  ];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(sampleAudioSchema)}
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section */}
        <section className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              NYC Subway Sounds Archive
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Listen to authentic New York subway sounds - from iconic &quot;stand clear&quot; announcements 
              to the unique ambiance of NYC&apos;s underground transit system.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                <span>▶️</span> Play Random Sound
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition">
                Download Sound Pack
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">500+</div>
                <div className="text-sm text-gray-600">Audio Clips</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">472</div>
                <div className="text-sm text-gray-600">Stations Covered</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">27</div>
                <div className="text-sm text-gray-600">Train Lines</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-black">2M+</div>
                <div className="text-sm text-gray-600">Plays</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Sounds Player */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Subway Sounds</h2>
            
            <div className="bg-gray-900 text-white rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Now Playing: Stand Clear of the Closing Doors</h3>
                  <p className="text-gray-400">Times Square-42 St Station</p>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                  Download
                </button>
              </div>
              <div className="bg-gray-800 rounded-full h-2 mb-4">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="hover:text-yellow-500">⏮️</button>
                  <button className="bg-yellow-500 text-black w-12 h-12 rounded-full flex items-center justify-center hover:bg-yellow-400">
                    ▶️
                  </button>
                  <button className="hover:text-yellow-500">⏭️</button>
                </div>
                <div className="text-sm text-gray-400">0:35 / 1:42</div>
              </div>
            </div>

            {/* Sound Categories */}
            {soundCategories.map((category) => (
              <div key={category.name} className="mb-12">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span>{category.icon}</span> {category.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.sounds.map((sound) => (
                    <div key={sound.name} className="bg-white border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800">
                            ▶️
                          </button>
                          <div>
                            <h4 className="font-semibold">{sound.name}</h4>
                            <div className="text-sm text-gray-600">
                              {sound.duration} • {sound.plays} plays
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-black">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Station Sounds Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Sounds by Popular Stations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularStations.map((station) => (
                <a
                  key={station.slug}
                  href={`/station/${station.slug}`}
                  className="bg-white p-4 rounded-lg text-center hover:shadow-lg transition"
                >
                  <div className="text-2xl mb-2">🎵</div>
                  <div className="font-semibold text-sm">{station.name}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 prose prose-lg">
            <h2 className="text-3xl font-bold mb-6">The Iconic Sounds of NYC Subway</h2>
            <p className="text-gray-700 mb-4">
              The New York City Subway has a unique acoustic signature that millions recognize instantly. 
              From the distinctive &quot;stand clear of the closing doors please&quot; announcement to the rumble of 
              trains arriving at platforms, these sounds are an integral part of NYC&apos;s cultural identity.
            </p>
            
            <h3 className="text-2xl font-bold mt-8 mb-4">What Makes Subway Sounds Unique?</h3>
            <p className="text-gray-700 mb-4">
              Each element of the subway&apos;s soundscape serves a purpose. The door chimes alert passengers, 
              conductor announcements provide crucial information, and even the sound of trains on tracks 
              tells experienced riders about speed and track conditions.
            </p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Recording Locations & Acoustic Characteristics</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Platform Recordings:</strong> Captured during peak and off-peak hours at major stations</li>
              <li><strong>Train Interior:</strong> Announcements and ambient sounds from inside various train models</li>
              <li><strong>Station Entrances:</strong> Turnstile sounds, MetroCard readers, and OMNY taps</li>
              <li><strong>Underground Tunnels:</strong> Echo effects and train approach warnings</li>
            </ul>

            <h3 className="text-2xl font-bold mt-8 mb-4">Uses for Subway Sound Archive</h3>
            <div className="grid md:grid-cols-2 gap-6 my-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Film & Media Production</h4>
                <p className="text-gray-700 text-sm">Authentic NYC atmosphere for movies, TV shows, and documentaries</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Music Production</h4>
                <p className="text-gray-700 text-sm">Sample unique sounds for beats, ambient tracks, and sound design</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Educational Resources</h4>
                <p className="text-gray-700 text-sm">Teaching materials about urban transportation and city sounds</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Nostalgia & Memory</h4>
                <p className="text-gray-700 text-sm">Preserve the evolving sounds of NYC&apos;s transit system</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4">Evolution of Subway Sounds</h3>
            <p className="text-gray-700 mb-4">
              NYC subway sounds have evolved significantly over the decades. From the mechanical clicking of 
              token turnstiles to today&apos;s electronic OMNY beeps, each era has its distinctive audio signature. 
              Our archive preserves both historical recordings and contemporary sounds, creating a comprehensive 
              audio timeline of NYC transit.
            </p>
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
            <a href="/subway-map" className="flex flex-col items-center py-2 text-xs font-medium text-gray-700">
              <span className="text-lg mb-1">🗺️</span>
              MAP
            </a>
            <a href="/subway-sounds" className="flex flex-col items-center py-2 text-xs font-medium text-black">
              <span className="text-lg mb-1">🔊</span>
              SOUNDS
            </a>
          </div>
        </div>
      </div>
    </>
  );
}