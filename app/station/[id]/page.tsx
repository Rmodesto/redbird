import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { mtaDataService } from '@/lib/services/mta-data-service';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';
import Navigation from '@/components/Navigation';
import AdSlot from '@/components/AdSlot';
import StationSoundSection from '@/components/station/StationSoundSection';
import StationArrivalsPanel from '@/components/station/StationArrivalsPanel';
import {
  buildPageTitle,
  buildMetaDescription,
  getMetadataKeywords,
  getSchemaKeywords,
} from '@/lib/utils/seo-keywords';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const stations = mtaDataService.getAllStations();
  const params: { id: string }[] = [];

  stations.forEach((station) => {
    params.push({ id: station.id });
    if (station.slug && station.slug !== station.id) {
      params.push({ id: station.slug });
    }
  });

  return params;
}

async function getStation(id: string) {
  return mtaDataService.getStationById(id) || mtaDataService.getStationBySlug(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const station = await getStation(id);

  if (!station) {
    return {
      title: 'Station Not Found',
      description: 'The requested subway station could not be found.',
    };
  }

  const title = buildPageTitle(station);
  const description = buildMetaDescription(station);
  const keywords = getMetadataKeywords(station);
  const ogImage = `/api/og?station=${encodeURIComponent(station.name)}&borough=${station.borough}&lines=${station.lines.join(',')}`;

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
      url: `/station/${station.slug}`,
      siteName: 'NYC Subway Sounds',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${station.name} Station - NYC Subway` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `/station/${station.slug}` },
    other: {
      'geo.position': `${station.latitude};${station.longitude}`,
      'geo.placename': station.name,
      'geo.region': 'US-NY',
      ICBM: `${station.latitude}, ${station.longitude}`,
    },
  };
}

/**
 * Official MTA trunk lines. Lines sharing a trunk share a colour and a corridor,
 * which is how the MTA itself groups services.
 */
const TRUNK: Record<string, { name: string; note: string }> = {
  '1': { name: 'Broadway–7 Av', note: 'Local and express' },
  '2': { name: 'Broadway–7 Av', note: 'Local and express' },
  '3': { name: 'Broadway–7 Av', note: 'Local and express' },
  '4': { name: 'Lexington Av', note: 'Local and express' },
  '5': { name: 'Lexington Av', note: 'Local and express' },
  '6': { name: 'Lexington Av', note: 'Local and express' },
  '7': { name: 'Flushing', note: 'Manhattan to Queens' },
  A: { name: '8 Av', note: 'Local and express' },
  C: { name: '8 Av', note: 'Local and express' },
  E: { name: '8 Av', note: 'Local and express' },
  B: { name: '6 Av', note: 'Local and express' },
  D: { name: '6 Av', note: 'Local and express' },
  F: { name: '6 Av', note: 'Local and express' },
  M: { name: '6 Av', note: 'Local and express' },
  G: { name: 'Crosstown', note: 'Brooklyn to Queens' },
  J: { name: 'Nassau St', note: 'Jamaica Line' },
  Z: { name: 'Nassau St', note: 'Jamaica Line' },
  L: { name: '14 St–Canarsie', note: 'Manhattan to Brooklyn' },
  N: { name: 'Broadway', note: 'Local and express' },
  Q: { name: 'Broadway', note: 'Local and express' },
  R: { name: 'Broadway', note: 'Local and express' },
  W: { name: 'Broadway', note: 'Local and express' },
  S: { name: 'Shuttle', note: 'Single-stop service' },
};

function groupByTrunk(lines: string[]) {
  const groups = new Map<string, { name: string; note: string; lines: string[] }>();
  for (const line of lines) {
    const trunk = TRUNK[line.toUpperCase()];
    if (!trunk) continue;
    const entry = groups.get(trunk.name) ?? { ...trunk, lines: [] };
    entry.lines.push(line.toUpperCase());
    groups.set(trunk.name, entry);
  }
  return Array.from(groups.values());
}

const LABEL = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';

export default async function StationPage({ params }: Props) {
  const { id } = await params;
  const station = await getStation(id);

  if (!station) {
    notFound();
  }

  const trunks = groupByTrunk(station.lines);

  const accessRows: { k: string; v: string }[] = [
    { k: 'ADA accessible', v: station.ada ? 'Yes' : 'No' },
    { k: 'Elevators', v: station.amenities?.elevators ? 'Yes' : 'No' },
    { k: 'Restrooms', v: station.amenities?.restrooms ? 'Yes' : 'No' },
    { k: 'Borough', v: station.borough },
    { k: 'Platforms', v: String(station.platforms?.length ?? 0) },
  ];

  const schemaKeywords = getSchemaKeywords();
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TransitStation',
        '@id': `https://www.subwaysounds.net/station/${station.slug}`,
        name: `${station.name} Station`,
        description: buildMetaDescription(station),
        url: `https://www.subwaysounds.net/station/${station.slug}`,
        keywords: [...schemaKeywords.transitStation, ...getMetadataKeywords(station).slice(0, 10)].join(', '),
        geo: { '@type': 'GeoCoordinates', latitude: station.latitude, longitude: station.longitude },
        address: {
          '@type': 'PostalAddress',
          addressLocality: station.borough,
          addressRegion: 'NY',
          addressCountry: 'US',
        },
        ...(station.ada && {
          amenityFeature: [
            { '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true },
          ],
        }),
      },
      {
        '@type': 'Place',
        '@id': `https://www.subwaysounds.net/station/${station.slug}#place`,
        name: station.name,
        keywords: schemaKeywords.place.join(', '),
        geo: { '@type': 'GeoCoordinates', latitude: station.latitude, longitude: station.longitude },
        address: {
          '@type': 'PostalAddress',
          addressLocality: station.borough,
          addressRegion: 'NY',
          addressCountry: 'US',
        },
      },
    ],
  };

  const serviceCount = station.lines.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Navigation />

      <div className="min-w-0 bg-station-ground font-sans text-station-ink">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <section
          className="text-white"
          style={{
            backgroundColor: '#0B0B0B',
            backgroundImage:
              'linear-gradient(#262626 1px,transparent 1px),linear-gradient(90deg,#262626 1px,transparent 1px),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)',
            backgroundSize: '21px 21px,21px 21px,5px 5px,5px 5px',
          }}
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-[34px] px-[21px] pb-[34px] pt-[34px] md:gap-[55px] md:px-[55px] md:pb-[55px]">
            <nav
              aria-label="Breadcrumb"
              className={`flex flex-wrap items-center gap-[13px] ${LABEL} text-station-dim`}
            >
              <Link href="/" className="text-station-dim no-underline hover:text-white">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/stations" className="text-station-dim no-underline hover:text-white">
                Stations
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{station.name}</span>
            </nav>

            <div className="flex flex-col items-start justify-between gap-[34px] lg:flex-row lg:items-end lg:gap-[55px]">
              <div className="flex min-w-0 flex-col gap-[21px]">
                <span className={`${LABEL} text-station-dim`}>&ldquo;Station&rdquo;</span>
                <h1 className="m-0 text-[clamp(40px,7vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                  {station.name}
                </h1>
                <div className="flex flex-wrap items-center gap-[21px]">
                  <SubwayLinesBadges lines={station.lines} size="md" />
                  <span className={`${LABEL} text-station-dim`}>
                    {station.borough}
                    {station.ada ? ' · ADA Accessible' : ''}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 gap-[13px]">
                <Link
                  href="/subway-map"
                  className={`flex h-[55px] items-center border border-white px-[34px] text-white no-underline transition-colors hover:bg-[#161616] ${LABEL}`}
                >
                  View on map
                </Link>
                <a
                  href="#sound"
                  className={`flex h-[55px] items-center bg-white px-[34px] text-station-ground no-underline transition-colors hover:bg-[#E5E5E5] ${LABEL}`}
                >
                  Play latest
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Paper panel ──────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-[21px] pb-[55px] md:px-[55px] md:pb-[89px]">
          <main className="relative grid grid-cols-1 gap-[55px] bg-station-paper p-[21px] outline-dashed outline-1 -outline-offset-8 outline-[#CFCFCF] md:p-[55px] lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:gap-[89px] lg:p-[89px]">
            {/* Index tab, like a filed document */}
            <span
              aria-hidden="true"
              className="absolute -left-[13px] top-[55px] hidden h-[21px] w-[55px] bg-station-accent lg:block"
            />

            <div className="flex min-w-0 flex-col gap-[55px]">
              <div id="sound" className="scroll-mt-[89px]">
                <StationSoundSection stationSlug={station.slug} stationName={station.name} />
              </div>

              {/* Zigzag rule */}
              <div
                aria-hidden="true"
                className="h-[8px]"
                style={{
                  backgroundImage:
                    "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23111%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)",
                  backgroundRepeat: 'repeat-x',
                }}
              />

              <section className="flex max-w-[610px] flex-col gap-[21px]">
                <span className={`${LABEL} text-station-muted`}>&ldquo;Details&rdquo;</span>
                <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em]">
                  About the station
                </h2>
                <p className="m-0 text-[18px] leading-[29px] text-station-ink [text-wrap:pretty]">
                  {station.name} is in {station.borough} and is served by{' '}
                  {serviceCount} {serviceCount === 1 ? 'service' : 'services'} across{' '}
                  {trunks.length} {trunks.length === 1 ? 'trunk line' : 'trunk lines'}
                  {station.platforms?.length
                    ? `, over ${station.platforms.length} ${station.platforms.length === 1 ? 'platform' : 'platforms'}`
                    : ''}
                  .
                </p>
                <p className="m-0 text-[18px] leading-[29px] text-station-ink [text-wrap:pretty]">
                  {station.ada
                    ? 'The station is ADA accessible.'
                    : 'The station is not ADA accessible.'}{' '}
                  Arrival times on this page come from the MTA&rsquo;s realtime feed and refresh
                  every 30 seconds.
                </p>
              </section>
            </div>

            {/* ── Aside ──────────────────────────────────────────── */}
            <aside className="flex min-w-0 flex-col gap-[34px]">
              <div className="border border-station-ink">
                <div className="flex h-[34px] items-center justify-between bg-station-panel px-[13px] text-white">
                  <span className="text-[13px] font-bold tracking-[.08em]">
                    &ldquo;Lines served&rdquo;
                  </span>
                  <span className="text-[13px] font-bold text-station-dim">{serviceCount}</span>
                </div>
                {trunks.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between gap-[13px] border-t border-station-rule p-[13px]"
                  >
                    <span className="flex min-w-0 flex-col gap-[3px]">
                      <span className="text-[16px] font-bold leading-[21px]">{t.name}</span>
                      <span className="text-[13px] leading-[21px] text-station-muted">{t.note}</span>
                    </span>
                    <SubwayLinesBadges lines={t.lines} size="md" className="justify-end" />
                  </div>
                ))}
              </div>

              <StationArrivalsPanel stationId={station.id} />

              <div className="border border-station-ink">
                <div className="flex h-[34px] items-center bg-station-panel px-[13px] text-white">
                  <span className="text-[13px] font-bold tracking-[.08em]">
                    &ldquo;Accessibility&rdquo;
                  </span>
                </div>
                {accessRows.map((row) => (
                  <div
                    key={row.k}
                    className="flex justify-between gap-[13px] border-t border-station-rule p-[13px] text-[16px] leading-[21px]"
                  >
                    <span className="text-station-muted">{row.k}</span>
                    <span className="font-bold">{row.v}</span>
                  </div>
                ))}
                <div className="border-t border-station-rule px-[13px] py-[8px] text-[13px] leading-[21px] text-station-muted">
                  Data: MTA Accessibility · Static GTFS
                </div>
              </div>

              <AdSlot size="square" />
            </aside>
          </main>
        </div>
      </div>
    </>
  );
}
