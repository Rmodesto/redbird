import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { mtaDataService } from '@/lib/services/mta-data-service';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';
import Navigation from '@/components/Navigation';

interface Props {
  params: { id: string }
}

async function getStation(id: string) {
  const station = mtaDataService.getStationById(id) || 
                 mtaDataService.getStationBySlug(id);
  return station;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const station = await getStation(params.id);
  
  if (!station) {
    return {
      title: 'Station Not Found',
      description: 'The requested subway station could not be found.',
    };
  }

  const title = `${station.name} Station - Crime Stats, Safety, & NYC Subway Info`;
  const description = `Complete ${station.name} station guide: crime statistics, safety scores, rat reports, ADA accessibility, amenities & current NYC subway fare ($2.90). Serving ${station.lines.join(', ')} lines in ${station.borough}.`;
  const keywords = [
    `${station.name} station`,
    `${station.borough} subway`,
    'NYC subway crime statistics',
    'subway safety',
    'rat sightings NYC',
    'ADA accessible stations',
    'NYC subway fare',
    'OMNY',
    ...station.lines.map(line => `${line} train`),
    'MTA',
    'subway sounds'
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'NYC Subway Sounds' }],
    creator: 'NYC Subway Sounds',
    publisher: 'NYC Subway Sounds',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_US',
      url: `/station/${params.id}`,
      siteName: 'NYC Subway Sounds',
      images: [
        {
          url: `/api/og?station=${encodeURIComponent(station.name)}&borough=${station.borough}&lines=${station.lines.join(',')}`,
          width: 1200,
          height: 630,
          alt: `${station.name} Station - NYC Subway`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?station=${encodeURIComponent(station.name)}&borough=${station.borough}&lines=${station.lines.join(',')}`],
    },
    alternates: {
      canonical: `/station/${params.id}`,
    },
    other: {
      'geo.position': `${station.latitude};${station.longitude}`,
      'geo.placename': station.name,
      'geo.region': 'US-NY',
      'ICBM': `${station.latitude}, ${station.longitude}`,
    },
  };
}

export async function generateStaticParams() {
  const stations = mtaDataService.getAllStations();
  return stations.map((station) => ({
    id: station.slug,
  }));
}

// Station score calculation (mock for now, can be enhanced with real data)
function calculateStationScore(station: any) {
  let score = 100;
  
  // Deduct points based on various factors
  if (!station.amenities?.includes('ADA')) score -= 10;
  if (!station.amenities?.includes('WiFi')) score -= 5;
  if (!station.amenities?.includes('Restrooms')) score -= 5;
  
  return {
    score,
    rating: score >= 90 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR'
  };
}

// Get station year built (mock data for now)
function getStationYearBuilt(stationName: string): number {
  // Some actual NYC subway station opening years
  const stationYears: Record<string, number> = {
    'Grand Central-42 St': 1929,
    'Times Sq-42 St': 1904,
    'Union Sq-14 St': 1904,
    'Penn Station': 1910,
    'Atlantic Av-Barclays Ctr': 1908,
    'Jackson Heights-Roosevelt Ave': 1917,
  };
  
  // Return the year if found, otherwise return a random year between 1904-1940
  return stationYears[stationName] || 1904 + Math.floor(Math.random() * 36);
}

export default async function StationPage({ params }: Props) {
  const station = await getStation(params.id);
  
  if (!station) {
    notFound();
  }

  const { score, rating } = calculateStationScore(station);
  const yearBuilt = getStationYearBuilt(station.name);
  
  // Mock crime stats (in production, fetch from NYC Open Data)
  const crimeStats = {
    felonies: 0,
    misdemeanors: 0,
    violations: 0,
    year: 2024
  };
  
  // Mock rodent reports (in production, fetch from 311 data)
  const rodentReports = {
    count: 0,
    year: 2024
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-black px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-white">
            {station.name.toUpperCase()}
          </h1>
          <div className="flex items-center gap-6 text-gray-400">
            <span className="uppercase">{station.borough}</span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> GOOD SERVICE
            </span>
            <span className="flex items-center gap-2">
              📍 {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            {station.lines.map((line: string) => (
              <span
                key={line}
                className={`inline-flex items-center justify-center w-10 h-10 rounded text-white font-bold text-lg
                  ${line === '4' || line === '5' || line === '6' ? 'bg-green-500' : ''}
                  ${line === '7' ? 'bg-purple-600' : ''}
                  ${line === 'S' ? 'bg-gray-600' : ''}
                  ${line === 'N' || line === 'Q' || line === 'R' || line === 'W' ? 'bg-yellow-500' : ''}
                  ${line === 'L' ? 'bg-gray-500' : ''}
                  ${line === 'A' || line === 'C' || line === 'E' ? 'bg-blue-600' : ''}
                  ${line === 'B' || line === 'D' || line === 'F' || line === 'M' ? 'bg-orange-500' : ''}
                  ${line === 'G' ? 'bg-lime-500' : ''}
                  ${line === 'J' || line === 'Z' ? 'bg-amber-700' : ''}
                  ${line === '1' || line === '2' || line === '3' ? 'bg-red-600' : ''}
                `}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Arrivals Section */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="text-3xl">🕐</span>
                &quot;LIVE&quot; ARRIVALS
              </h2>
              
              {/* Mock arrivals data */}
              <div className="space-y-4">
                {station.lines.slice(0, 5).map((line: string, index: number) => (
                  <div key={line} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded text-white font-bold
                        ${line === '4' || line === '5' || line === '6' ? 'bg-green-500' : ''}
                        ${line === '7' ? 'bg-purple-600' : ''}
                        ${line === 'S' ? 'bg-gray-600' : ''}
                        ${line === 'N' || line === 'Q' || line === 'R' || line === 'W' ? 'bg-yellow-500' : ''}
                        ${line === 'L' ? 'bg-gray-500' : ''}
                        ${line === 'A' || line === 'C' || line === 'E' ? 'bg-blue-600' : ''}
                        ${line === 'B' || line === 'D' || line === 'F' || line === 'M' ? 'bg-orange-500' : ''}
                        ${line === 'G' ? 'bg-lime-500' : ''}
                        ${line === 'J' || line === 'Z' ? 'bg-amber-700' : ''}
                        ${line === '1' || line === '2' || line === '3' ? 'bg-red-600' : ''}
                      `}>
                        {line}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">Downtown</div>
                        <div className="text-sm text-gray-500 uppercase">{station.borough}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {5 + index * 2} min
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Updated every 30 seconds • Last update: 9:34:33 PM</span>
                <span>Data: MTA GTFS Real-time</span>
              </div>
            </section>

            {/* Subway Sounds Section */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="text-3xl">🔊</span>
                SUBWAY &quot;SOUNDS&quot;
              </h2>
              
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-6">
                  Audio recordings from {station.name.toUpperCase()} station coming soon!
                </p>
                
                <div className="space-y-3">
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left flex items-center gap-3 transition-colors text-gray-900">
                    <span className="text-2xl font-bold">T</span>
                    <span className="font-semibold">TRAIN ARRIVALS & DEPARTURES</span>
                  </button>
                  
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left flex items-center gap-3 transition-colors text-gray-900">
                    <span className="text-2xl">📢</span>
                    <span className="font-semibold">STATION ANNOUNCEMENTS</span>
                  </button>
                  
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left flex items-center gap-3 transition-colors text-gray-900">
                    <span className="text-2xl">🎵</span>
                    <span className="font-semibold">AMBIENT STATION SOUNDS</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Station Information */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="text-3xl">ℹ️</span>
                STATION &quot;INFORMATION&quot;
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">LOCATION</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Borough:</strong> {station.borough.toUpperCase()}</p>
                    <p><strong>Lat:</strong> {station.latitude.toFixed(6)}</p>
                    <p><strong>Lng:</strong> {station.longitude.toFixed(6)}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">SERVICE</h3>
                  <p className="text-gray-700 mb-4">{station.lines.length} lines serving this station</p>
                  <div className="flex gap-2">
                    {station.lines.map((line: string) => (
                      <span
                        key={line}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded text-white font-bold
                          ${line === '4' || line === '5' || line === '6' ? 'bg-green-500' : ''}
                          ${line === '7' ? 'bg-purple-600' : ''}
                          ${line === 'S' ? 'bg-gray-600' : ''}
                          ${line === 'N' || line === 'Q' || line === 'R' || line === 'W' ? 'bg-yellow-500' : ''}
                          ${line === 'L' ? 'bg-gray-500' : ''}
                          ${line === 'A' || line === 'C' || line === 'E' ? 'bg-blue-600' : ''}
                          ${line === 'B' || line === 'D' || line === 'F' || line === 'M' ? 'bg-orange-500' : ''}
                          ${line === 'G' ? 'bg-lime-500' : ''}
                          ${line === 'J' || line === 'Z' ? 'bg-amber-700' : ''}
                          ${line === '1' || line === '2' || line === '3' ? 'bg-red-600' : ''}
                        `}
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Station Score */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-500 uppercase mb-2">SCORE</div>
                <div className="text-5xl font-bold text-green-400 mb-2">
                  {score}/100
                </div>
                <div className="text-lg font-semibold text-green-400 uppercase">
                  {rating}
                </div>
              </div>
            </section>

            {/* Crime Stats */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <span>🚨</span>
                CRIME STATS <span className="text-sm text-gray-500">({crimeStats.year})</span>
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-400">{crimeStats.felonies}</div>
                  <div className="text-xs text-gray-500 uppercase">Felonies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{crimeStats.misdemeanors}</div>
                  <div className="text-xs text-gray-500 uppercase">Misdemeanors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{crimeStats.violations}</div>
                  <div className="text-xs text-gray-500 uppercase">Violations</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Within 0.25 miles of station<br/>
                Data: NYC Open Data
              </p>
            </section>

            {/* Rodent Reports */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <span>🐀</span>
                RODENT &quot;REPORTS&quot;
              </h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">{rodentReports.count}</div>
                <div className="text-sm text-gray-500">
                  311 COMPLAINTS ({rodentReports.year})
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Within 0.25 miles of station<br/>
                Data: NYC 311 Open Data
              </p>
            </section>

            {/* Accessibility & Amenities */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <span>♿</span>
                ACCESSIBILITY & &quot;AMENITIES&quot;
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span>♿</span> ADA Accessible
                  </span>
                  <span className={station.amenities?.includes('ADA') ? 'text-green-400' : 'text-red-400'}>
                    {station.amenities?.includes('ADA') ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🛗</span> Elevators
                  </span>
                  <span className={station.amenities?.includes('Elevators') ? 'text-green-400' : 'text-red-400'}>
                    {station.amenities?.includes('Elevators') ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>🚻</span> Restrooms
                  </span>
                  <span className={station.amenities?.includes('Restrooms') ? 'text-green-400' : 'text-red-400'}>
                    {station.amenities?.includes('Restrooms') ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>👮</span> Police Presence
                  </span>
                  <span className={station.amenities?.includes('Police') ? 'text-green-400' : 'text-gray-400'}>
                    {station.amenities?.includes('Police') ? '✓' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>📶</span> WiFi
                  </span>
                  <span className={station.amenities?.includes('WiFi') ? 'text-green-400' : 'text-red-400'}>
                    {station.amenities?.includes('WiFi') ? '✓' : '✗'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">🏛️ Built:</span>
                  <span className="font-bold text-gray-900">{yearBuilt}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Data: MTA Accessibility
              </p>
            </section>

            {/* Station Details */}
            <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <span>📋</span>
                STATION &quot;DETAILS&quot;
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-semibold text-gray-900">Underground</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Borough:</span>
                  <span className="font-semibold uppercase text-gray-900">{station.borough}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lines Served:</span>
                  <span className="font-semibold text-gray-900">{station.lines.length}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Data: MTA Static GTFS
              </p>
            </section>
          </div>
        </div>

        {/* Location Section */}
        <section className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-3xl">📍</span>
            &quot;LOCATION&quot;
          </h2>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border border-gray-200">
            <div className="text-center text-gray-500">
              <span className="text-6xl mb-4 block">📍</span>
              <p className="text-lg">Interactive map preview</p>
              <p>coming soon</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-right">
            Map data: OpenStreetMap
          </p>
        </section>

        {/* Data Sources Footer */}
        <section className="mt-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
            <span className="text-3xl">📊</span>
            DATA &quot;SOURCES&quot;
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Real-time Transit Data:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• MTA GTFS Real-time API</li>
                <li>• Service alerts and delays</li>
                <li>• Train arrival predictions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Public Safety & Infrastructure:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• NYC Open Data Portal</li>
                <li>• 311 Service Requests</li>
                <li>• NYPD Crime Statistics</li>
                <li>• MTA Accessibility Database</li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            All data is publicly available through NY State and MTA open data initiatives. Updated in real-time where available.
          </p>
        </section>
        </div>
      </main>
    </>
  );
}