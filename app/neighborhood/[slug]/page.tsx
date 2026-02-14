import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSEOMetadata } from "@/lib/seo";
import { generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import Navigation from "@/components/Navigation";
import NeighborhoodService, { Neighborhood } from "@/lib/services/neighborhood-service";
import { mtaDataService, Station } from "@/lib/services/mta-data-service";
import Link from "next/link";

// MTA line colors
const LINE_COLORS: Record<string, string> = {
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
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const neighborhoodService = NeighborhoodService.getInstance();
  const neighborhoods = neighborhoodService.getAllNeighborhoods();
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const neighborhoodService = NeighborhoodService.getInstance();
  const data = neighborhoodService.getNeighborhood(slug);

  if (!data) {
    return generateSEOMetadata({
      title: 'Neighborhood Not Found',
      description: 'The requested neighborhood page could not be found.',
    });
  }

  const stationCount = data.stationSlugs.length;

  return generateSEOMetadata({
    title: `Subway Stations Near ${data.name}, ${data.borough} - NYC Subway Guide`,
    description: `Find all ${stationCount} subway stations near ${data.name}. Lines: ${data.keyLines.join(', ')}. ${data.editorialIntro.slice(0, 120)}...`,
    keywords: [
      `subway near ${data.name}`,
      `${data.name} train station`,
      `${data.name} subway`,
      `closest subway to ${data.name}`,
      `${data.name} mta`,
      `${data.borough} subway stations`,
      ...data.keyLines.map((line) => `${line} train ${data.name}`),
    ],
    canonical: `/neighborhood/${slug}`,
  });
}

export default async function NeighborhoodPage({ params }: PageProps) {
  const { slug } = await params;
  const neighborhoodService = NeighborhoodService.getInstance();

  const neighborhood = neighborhoodService.getNeighborhood(slug);

  if (!neighborhood) {
    notFound();
  }

  // Get stations in this neighborhood
  const stations: Station[] = [];
  for (const stationSlug of neighborhood.stationSlugs) {
    const station = mtaDataService.getStationBySlug(stationSlug);
    if (station) {
      stations.push(station);
    }
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Stations", url: "/stations" },
    { name: neighborhood.name, url: `/neighborhood/${slug}` },
  ]);

  // Local business schema for the neighborhood
  const neighborhoodSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: `${neighborhood.name}, ${neighborhood.borough}`,
    description: neighborhood.editorialIntro,
    address: {
      '@type': 'PostalAddress',
      addressLocality: neighborhood.borough,
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    containsPlace: stations.map((station) => ({
      '@type': 'TransitStation',
      name: `${station.name} Subway Station`,
      url: `https://subwaysounds.net/station/${station.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(neighborhoodSchema)}
      />

      <div className="min-h-screen bg-white">
        <Navigation />

        {/* Hero Section */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-sm text-gray-400 mb-2">
              <Link href="/stations" className="hover:text-white">Stations</Link>
              <span className="mx-2">/</span>
              <span>{neighborhood.borough}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Subway Stations Near {neighborhood.name}
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl">
              {neighborhood.editorialIntro}
            </p>

            {/* Line badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {neighborhood.keyLines.map((line) => (
                <span
                  key={line}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: LINE_COLORS[line] || '#666',
                    color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff',
                  }}
                >
                  {line}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                {stations.length} Stations
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                {neighborhood.keyLines.length} Lines
              </span>
              <span className="bg-white/10 px-4 py-2 rounded-lg">
                {neighborhood.borough}
              </span>
            </div>
          </div>
        </section>

        {/* Landmarks */}
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500 text-sm">Nearby:</span>
              {neighborhood.landmarks.map((landmark) => (
                <span key={landmark} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm">
                  {landmark}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Stations List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Subway Stations in {neighborhood.name}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((station) => (
                <Link
                  key={station.slug}
                  href={`/station/${station.slug}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{station.name}</h3>
                    {station.ada && (
                      <span className="text-blue-600 text-sm" title="ADA Accessible">
                        &#9855;
                      </span>
                    )}
                  </div>

                  {/* Station line badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {station.lines.map((line) => (
                      <span
                        key={line}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: LINE_COLORS[line] || '#666',
                          color: ['N', 'Q', 'R', 'W'].includes(line) ? '#000' : '#fff',
                        }}
                      >
                        {line}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500">
                    {station.lines.length === 1 ? '1 line' : `${station.lines.length} lines`}
                    {station.ada && ' \u2022 Accessible'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Getting to {neighborhood.name}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-3">By Subway</h3>
                <p className="text-gray-700 mb-4">
                  {neighborhood.name} is served by {neighborhood.keyLines.length} subway lines:
                  the {neighborhood.keyLines.join(', ')} trains. The closest stations are
                  {' '}{stations.slice(0, 3).map((s) => s.name).join(', ')}.
                </p>
                <Link
                  href="/subway-map"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on interactive map &rarr;
                </Link>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Accessibility</h3>
                <p className="text-gray-700">
                  {stations.filter((s) => s.ada).length} of {stations.length} stations
                  in {neighborhood.name} are ADA accessible with elevators.
                </p>
                {stations.filter((s) => s.ada).length > 0 && (
                  <ul className="mt-2 text-sm text-gray-600">
                    {stations.filter((s) => s.ada).map((s) => (
                      <li key={s.slug} className="flex items-center gap-2">
                        <span className="text-blue-600">&#9855;</span>
                        <Link href={`/station/${s.slug}`} className="hover:underline">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Neighborhoods */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Nearby Neighborhoods</h2>
            <div className="flex flex-wrap gap-3">
              {neighborhoodService
                .getNeighborhoodsByBorough(neighborhood.borough)
                .filter((n) => n.slug !== slug)
                .slice(0, 6)
                .map((n) => (
                  <Link
                    key={n.slug}
                    href={`/neighborhood/${n.slug}`}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm transition"
                  >
                    {n.name}
                  </Link>
                ))}
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
