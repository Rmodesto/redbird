import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import stationsData from '@/data/nyc-subway-stations-official.json';
import type { SubwayStation } from '@/app/api/subway-stations/route';

// MTA Line Colors
const MTA_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183',
} as const;

interface Props {
  params: { id: string }
}

async function getStation(id: string): Promise<SubwayStation | null> {
  const station = stationsData.stations.find(s => s.id === id);
  return station ? {
    ...station,
    coordinates: station.coordinates as [number, number]
  } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const station = await getStation(params.id);
  
  if (!station) {
    return {
      title: 'Station Not Found',
      description: 'The requested subway station could not be found.',
    };
  }

  const title = `${station.name} Station - NYC Subway Sounds`;
  const description = `Listen to real subway sounds from ${station.name} station in ${station.borough}. Serving ${station.lines.join(', ')} lines.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/station/${params.id}`,
    },
  };
}

export async function generateStaticParams() {
  // Generate static params for all stations
  return stationsData.stations.map((station) => ({
    id: station.id,
  }));
}

export default async function StationPage({ params }: Props) {
  const station = await getStation(params.id);
  
  if (!station) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Map
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {station.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {station.borough} • {station.coordinates[1].toFixed(6)}, {station.coordinates[0].toFixed(6)}
                </p>
                
                {/* Subway Lines */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {station.lines.map((line) => (
                    <span
                      key={line}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: MTA_COLORS[line as keyof typeof MTA_COLORS] || '#808183' }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Station ID</h3>
                  <code className="text-sm text-blue-700">{station.id}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subway Sounds Section */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎵 Subway Sounds
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 mb-4">
                    Audio recordings from {station.name} station coming soon!
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border">
                      🚇 Train Arrivals & Departures
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      📢 Station Announcements  
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      🎶 Ambient Station Sounds
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Station Information */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ℹ️ Station Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{station.borough}</p>
                  <p className="text-sm text-gray-500">
                    Lat: {station.coordinates[1].toFixed(6)}<br/>
                    Lng: {station.coordinates[0].toFixed(6)}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Service</h3>
                  <p className="text-gray-600">
                    {station.lines.length} line{station.lines.length !== 1 ? 's' : ''} serving this station
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {station.lines.map((line) => (
                      <span
                        key={line}
                        className="text-xs px-2 py-1 rounded text-white font-medium"
                        style={{ backgroundColor: MTA_COLORS[line as keyof typeof MTA_COLORS] || '#808183' }}
                      >
                        {line} Line
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Preview */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location</h3>
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Interactive map preview<br/>
                  coming soon
                </p>
              </div>
              <Link
                href={`/?station=${station.id}`}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
              >
                View on Map
              </Link>
            </section>

            {/* Quick Stats */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Borough:</span>
                  <span className="font-medium">{station.borough}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lines:</span>
                  <span className="font-medium">{station.lines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Complex:</span>
                  <span className="font-medium">{station.complex ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </section>

            {/* Related Stations */}
            <section className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Related Stations</h3>
              <p className="text-sm text-gray-500 text-center py-4">
                Nearby stations and transfers<br/>
                coming soon
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}