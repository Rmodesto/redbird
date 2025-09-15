import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { mtaDataService } from '@/lib/services/mta-data-service';
import Navigation from '@/components/Navigation';

// New component imports
import {
  StationHeader,
  LiveArrivalsCard,
  StationScoreCard,
  CrimeStatsCard,
  RodentReportsCard,
  AmenitiesCard,
  SubwaySoundsCard,
  StationDetailsCard
} from '@/components/station';

// Hook imports
import {
  useStationScore,
  generateMockCrimeStats,
  generateMockRodentReports,
  generateMockAmenities,
  generateMockLiveArrivals
} from '@/lib/hooks/useStationData';

interface Props {
  params: { id: string }
}

async function getStation(id: string) {
  const station = mtaDataService.getStationById(id) || 
                 mtaDataService.getStationBySlug(id);
  return station;
}

// Keep existing metadata generation (unchanged)
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
  
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export async function generateStaticParams() {
  const stations = mtaDataService.getAllStations();
  return stations.map((station) => ({
    id: station.slug,
  }));
}

export default async function StationPageRefactored({ params }: Props) {
  const station = await getStation(params.id);
  
  if (!station) {
    notFound();
  }

  // Generate mock data using our hooks/utilities
  // Ensure amenities is an array for type compatibility
  const stationWithAmenities = {
    ...station,
    amenities: station.amenities || []
  };
  const stationScore = useStationScore(stationWithAmenities);
  const crimeStats = generateMockCrimeStats();
  const rodentReports = generateMockRodentReports();
  const amenities = generateMockAmenities(stationWithAmenities);
  const liveArrivals = generateMockLiveArrivals(stationWithAmenities);

  return (
    <>
      <Navigation />
      
      <main className="min-h-screen bg-gray-50">
        {/* Clean, reusable header component */}
        <StationHeader station={stationWithAmenities} serviceStatus="good" />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Live Arrivals - Now a clean, reusable component */}
              <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
                <LiveArrivalsCard arrivals={liveArrivals} />
              </Suspense>

              {/* Subway Sounds - Reusable component */}
              <SubwaySoundsCard station={stationWithAmenities} />

              {/* Station Information - Could be further broken down */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">LOCATION</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Borough:</strong> {station.borough.toUpperCase()}</p>
                    <p><strong>Lat:</strong> {station.latitude.toFixed(6)}</p>
                    <p><strong>Lng:</strong> {station.longitude.toFixed(6)}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-900">SERVICE</h3>
                  <p className="text-gray-700 mb-4">{station.lines.length} lines serving this station</p>
                  <div className="flex gap-2">
                    {station.lines.map((line) => (
                      <span
                        key={line}
                        className="inline-flex items-center justify-center w-10 h-10 rounded text-white font-bold bg-gray-500"
                      >
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - All clean, reusable components */}
            <div className="space-y-8">
              
              {/* Station Score Component */}
              {stationScore && <StationScoreCard score={stationScore} />}
              
              {/* Crime Stats Component */}
              <CrimeStatsCard crimeStats={crimeStats} />
              
              {/* Rodent Reports Component */}
              <RodentReportsCard rodentReports={rodentReports} />
              
              {/* Amenities Component */}
              <AmenitiesCard amenities={amenities} />
              
              {/* Station Details Component */}
              <StationDetailsCard station={stationWithAmenities} amenities={amenities} />
              
            </div>
          </div>

          {/* Location Section - Could be its own component */}
          <section className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
              <span className="text-3xl">📍</span>
              "LOCATION"
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

          {/* Data Sources Footer - Could be its own component */}
          <section className="mt-12 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
              <span className="text-3xl">📊</span>
              DATA "SOURCES"
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