import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { generateMapSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Dynamically import the fixed map component to avoid SSR issues
const SubwayMap = dynamicImport(
  () => import('@/components/SubwayMapFixed'),
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
  "Real-Time 3D NYC Subway Map - Live Train Tracker | Subway Sounds",
  "Experience NYC's subway system in real-time 3D! Track live trains, explore all 472 stations, and navigate with our interactive 3D subway map featuring authentic MTA data and stunning visuals.",
  [
    "NYC subway map 3D",
    "real-time train tracker",
    "live subway map NYC",
    "3D transit map",
    "MTA real-time",
    "interactive subway map",
    "NYC train positions",
    "subway visualization",
    "live train tracking",
    "3D subway experience",
  ]
);

const mapSchema = generateMapSchema();
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "3D Subway Map", url: "/map" },
]);

export default function RealTimeMapPage() {
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
      
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-black text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-yellow-400 hover:text-yellow-300 transition"
              title="Back to Home"
            >
              ← Home
            </a>
            <h1 className="text-xl font-bold">
              🗽 NYC Subway Live Map
            </h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time updates
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-300">
              {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition"
              title="Refresh data"
            >
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Map Container */}
        <main className="flex-1 relative">
          <SubwayMap className="w-full h-full" />
          
          {/* Mobile Info Banner */}
          <div className="md:hidden absolute top-2 left-2 right-2 bg-black/80 text-white p-2 rounded text-center text-sm">
            <span className="text-yellow-400">💡</span> Tap stations & trains for details • Pinch to zoom
          </div>
          
          {/* Keyboard Shortcuts (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-2 transform -translate-y-1/2">
            <div className="bg-black/70 text-white p-3 rounded-lg text-xs space-y-1">
              <div className="font-bold mb-2">Shortcuts</div>
              <div><kbd className="bg-gray-700 px-1 rounded">3</kbd> Toggle 3D</div>
              <div><kbd className="bg-gray-700 px-1 rounded">T</kbd> Quick Tour</div>
              <div><kbd className="bg-gray-700 px-1 rounded">R</kbd> Refresh</div>
              <div><kbd className="bg-gray-700 px-1 rounded">F</kbd> Fullscreen</div>
            </div>
          </div>
        </main>

        {/* Footer Info */}
        <footer className="bg-black text-gray-400 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>© 2024 Subway Sounds NYC</span>
            <span>•</span>
            <span>Data updates every 30 seconds</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Powered by MapLibre GL</span>
            <span>•</span>
            <a href="/subway-sounds" className="text-blue-400 hover:text-blue-300">
              🔊 Subway Sounds
            </a>
          </div>
        </footer>
      </div>
      
      {/* Add keyboard shortcuts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('keydown', function(e) {
              if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
              
              switch(e.key.toLowerCase()) {
                case '3':
                  // Trigger 3D toggle
                  document.querySelector('button:contains("3D Mode")')?.click();
                  break;
                case 't':
                  // Trigger quick tour
                  document.querySelector('button:contains("Quick Tour")')?.click();
                  break;
                case 'r':
                  e.preventDefault();
                  window.location.reload();
                  break;
                case 'f':
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                  break;
              }
            });
          `
        }}
      />
    </>
  );
}