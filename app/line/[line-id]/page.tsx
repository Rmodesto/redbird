import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { mtaDataService, type Station } from '@/lib/services/mta-data-service';
import { getLineRoute, getAllLineIds } from '@/lib/map/subwayLineRoutes';
import { generateLineMetadata } from '@/lib/seo';
import { generateLineSchema } from '@/lib/structured-data';
import SiteHeader from '@/components/site/SiteHeader';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';
import AdSlot from '@/components/AdSlot';
import LineRecordingsPanel from '@/components/line/LineRecordingsPanel';

interface Props {
  params: Promise<{ 'line-id': string }>;
}

/** The boroughs the subway reaches, in the order the MTA lists them. */
const BOROUGH_ORDER = ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Staten Island'];

const DIVISION_NAME: Record<string, string> = {
  IRT: 'Interborough Rapid Transit',
  BMT: 'Brooklyn–Manhattan Transit',
  IND: 'Independent Subway System',
  SIR: 'Staten Island Railway',
};

export async function generateStaticParams() {
  return getAllLineIds()
    .filter((id) => id !== 'TEST')
    .map((id) => ({ 'line-id': id.toLowerCase() }));
}

function resolveLine(raw: string) {
  const lineId = decodeURIComponent(raw).toUpperCase();
  if (lineId === 'TEST') return null;

  const info = mtaDataService.getLineInfo(lineId);
  const stations = mtaDataService.getStationsByLine(lineId);
  if (!info || stations.length === 0) return null;

  const route = getLineRoute(lineId);
  // "1 - Broadway-7th Avenue Local" → "Broadway-7th Avenue Local"
  const title = route?.name.split(' - ').slice(1).join(' - ') || `${lineId} Train`;

  return { lineId, info, stations, title };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'line-id': raw } = await params;
  const line = resolveLine(raw);

  if (!line) {
    return {
      title: 'Line Not Found',
      description: 'The requested subway line could not be found.',
    };
  }

  const base = generateLineMetadata(line.lineId);
  return {
    ...base,
    title: `${line.lineId} Train — ${line.title} | NYC Subway Sounds`,
    description: `The ${line.lineId} train, ${line.title}. All ${line.stations.length} stations, transfers, accessibility and platform recordings from the ${line.lineId} line.`,
  };
}

/** Groups the line's stations by borough, keeping the MTA's borough order. */
function groupByBorough(stations: Station[]) {
  const map = new Map<string, Station[]>();
  for (const station of stations) {
    const list = map.get(station.borough) ?? [];
    list.push(station);
    map.set(station.borough, list);
  }
  return BOROUGH_ORDER.filter((b) => map.has(b)).map((borough) => ({
    borough,
    // Alphabetical, not route order: the station dataset carries no running
    // order for a service, and a guessed sequence would be a fabricated one.
    stations: (map.get(borough) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

const TABS = [
  { label: 'Stations', href: '#stations', quoted: false, active: true },
  { label: 'Sounds', href: '#sounds', quoted: true, active: false },
  { label: 'Map', href: '/subway-map', quoted: false, active: false },
];

export default async function LinePage({ params }: Props) {
  const { 'line-id': raw } = await params;
  const line = resolveLine(raw);

  if (!line) {
    notFound();
  }

  const { lineId, info, stations, title } = line;

  const groups = groupByBorough(stations);
  const adaCount = stations.filter((s) => s.ada).length;
  const transferCount = stations.filter((s) => s.lines.length > 1).length;

  const terminals = info.terminals
    ? `${info.terminals.south} to ${info.terminals.north}`
    : info.routes?.length
      ? `${info.routes.join(' · ')} shuttles`
      : `${stations.length} stations across New York City`;

  const facts = [
    { v: String(stations.length), k: 'Stations' },
    { v: String(groups.length), k: groups.length === 1 ? 'Borough' : 'Boroughs' },
    { v: String(adaCount), k: 'ADA Stops' },
  ];

  const schema = generateLineSchema(
    lineId,
    stations.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      latitude: s.latitude,
      longitude: s.longitude,
      borough: s.borough,
      lines: s.lines,
    })),
  );

  const stationRefs = stations.map((s) => ({
    slug: s.slug,
    name: s.name,
    borough: s.borough,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SiteHeader active="lines" />

      <div className="min-w-0 bg-jet font-sans text-ink">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <section className="surface-ripstop text-paper">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-f34 px-f21 pb-f34 pt-f21 md:px-f55 md:pb-f55 md:pt-f34 lg:gap-f55">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-f13 text-label font-bold uppercase text-graphite"
            >
              <Link href="/" className="text-graphite no-underline hover:text-paper">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/lines" className="text-graphite no-underline hover:text-paper">
                Lines
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-paper">{lineId}</span>
            </nav>

            <div className="flex flex-col items-start gap-f34 lg:flex-row lg:items-center lg:gap-f55">
              <span
                aria-hidden="true"
                className="flex h-f89 w-f89 shrink-0 items-center justify-center rounded-full text-[55px] font-bold leading-none md:h-f144 md:w-f144 md:text-[89px]"
                style={{ backgroundColor: info.color, color: info.textColor }}
              >
                {lineId}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-f13 lg:gap-f21">
                <span className="quoted text-label font-bold uppercase text-graphite">Line</span>
                <h1 className="m-0 text-[clamp(34px,6vw,68px)] font-bold uppercase leading-[1] tracking-[-.02em]">
                  {title}
                </h1>
                <p className="m-0 text-body-lg text-paper [text-wrap:pretty]">{terminals}</p>
              </div>

              <div className="grid w-full shrink-0 grid-cols-3 gap-px border border-ripstop bg-ripstop lg:w-auto">
                {facts.map((f) => (
                  <div
                    key={f.k}
                    className="flex flex-col gap-f5 bg-suede px-f13 py-f13 md:px-f34 md:py-f21"
                  >
                    <span className="text-h3 font-bold tabular-nums md:text-h2">{f.v}</span>
                    <span className="text-label font-bold uppercase text-graphite">{f.k}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Paper panel ──────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-f8 pb-f55 md:px-f55 md:pb-f89">
          <main className="panel relative flex flex-col gap-f34 p-f21 md:gap-f55 md:p-f55 lg:p-f89 lg:pt-f55">
            <span aria-hidden="true" className="panel-tag hidden lg:block" />
            <span aria-hidden="true" className="panel-tag-thread hidden lg:block" />

            {/* Tabs */}
            <div className="flex gap-f21 overflow-x-auto border-b border-seam md:gap-f34">
              {TABS.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className={`relative flex h-f55 shrink-0 items-center whitespace-nowrap text-label font-bold uppercase no-underline transition-colors ${
                    t.active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span className={t.quoted ? 'quoted' : undefined}>{t.label}</span>
                  {t.active && (
                    <span
                      aria-hidden="true"
                      className="surface-lace absolute -bottom-px left-0 right-0 h-f5"
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-f55 lg:grid-cols-golden lg:gap-f89">
              {/* ── Stations ─────────────────────────────────────── */}
              <div className="flex min-w-0 flex-col gap-f34">
                <div
                  id="stations"
                  className="flex scroll-mt-f89 flex-col items-start justify-between gap-f13 md:flex-row md:items-end md:gap-f34"
                >
                  <div className="flex min-w-0 flex-col gap-f8">
                    <span className="quoted text-label font-bold uppercase text-muted">
                      Stations
                    </span>
                    <h2 className="m-0 text-h3 font-bold tracking-[-.01em] md:text-h2">
                      {stations.length} stations, A–Z by borough
                    </h2>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-f13 text-label normal-case tracking-normal text-muted md:gap-f21">
                    <span className="flex items-center gap-f8">
                      <span
                        aria-hidden="true"
                        className="box-border h-f13 w-f13 rounded-full border-[3px] border-ink bg-paper"
                      />
                      Transfer
                    </span>
                    <span className="flex items-center gap-f8">
                      <span aria-hidden="true" className="h-f8 w-f8 rounded-full bg-ink" />
                      {lineId} train only
                    </span>
                  </div>
                </div>

                {groups.map((group) => (
                  <div key={group.borough} className="flex flex-col">
                    <div className="flex items-center gap-f13 border-b border-ink pb-f13">
                      <span className="quoted text-label font-bold uppercase">
                        {group.borough}
                      </span>
                      <span className="text-label normal-case tracking-normal text-muted">
                        {group.stations.length}{' '}
                        {group.stations.length === 1 ? 'station' : 'stations'}
                      </span>
                    </div>

                    {group.stations.map((station) => {
                      const transfers = station.lines
                        .map((l) => l.toUpperCase())
                        .filter((l) => l !== lineId);

                      return (
                        <Link
                          key={station.id}
                          href={`/station/${station.slug}`}
                          className="flex min-h-f55 items-stretch gap-f13 border-b border-seam text-ink no-underline transition-colors hover:bg-[#FAFAFA] md:gap-f21"
                        >
                          {/* Rail + stop */}
                          <span className="relative flex w-f21 shrink-0 items-center justify-center md:w-f34">
                            <span
                              aria-hidden="true"
                              className="absolute left-1/2 top-0 -ml-[2px] w-f5"
                              style={{ backgroundColor: info.color, bottom: '-1px' }}
                            />
                            {transfers.length > 0 ? (
                              <span
                                aria-hidden="true"
                                className="relative box-border h-f13 w-f13 rounded-full border-[3px] border-ink bg-paper"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="relative h-f8 w-f8 rounded-full bg-ink"
                              />
                            )}
                          </span>

                          <span className="flex min-w-0 flex-1 flex-col justify-center gap-f5 py-f8 md:flex-row md:items-center md:justify-between md:gap-f21">
                            <span className="text-body font-bold leading-[21px]">
                              {station.name}
                            </span>
                            <span className="flex items-center justify-between gap-f13 md:justify-end md:gap-f21">
                              {transfers.length > 0 ? (
                                <SubwayLinesBadges
                                  lines={transfers}
                                  size="sm"
                                  className="justify-end"
                                />
                              ) : (
                                <span />
                              )}
                              <span className="w-f55 shrink-0 text-right text-label normal-case tracking-normal text-muted md:w-f89">
                                {station.ada ? 'ADA' : ''}
                              </span>
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                {/* Zigzag rule */}
                <div
                  aria-hidden="true"
                  className="bg-stitch-ink h-f8 bg-repeat-x"
                  style={{ backgroundSize: '8px 8px' }}
                />

                <section className="flex max-w-f610 flex-col gap-f13">
                  <span className="quoted text-label font-bold uppercase text-muted">Details</span>
                  <h2 className="m-0 text-h3 font-bold tracking-[-.01em]">
                    About the {lineId} train
                  </h2>
                  <p className="m-0 text-body text-ink [text-wrap:pretty]">
                    The {lineId} runs as the {title} on the {info.division} division
                    {DIVISION_NAME[info.division] ? ` (${DIVISION_NAME[info.division]})` : ''}. It
                    serves {stations.length} {stations.length === 1 ? 'station' : 'stations'} across{' '}
                    {groups.length} {groups.length === 1 ? 'borough' : 'boroughs'}
                    {groups.length > 0 ? `: ${groups.map((g) => g.borough).join(', ')}` : ''}.
                  </p>
                  <p className="m-0 text-body text-ink [text-wrap:pretty]">
                    {transferCount} of those stops offer a transfer to another service, and{' '}
                    {adaCount} {adaCount === 1 ? 'is' : 'are'} ADA accessible. Station data comes
                    from the MTA&rsquo;s static GTFS feed and accessibility listings.
                  </p>
                </section>
              </div>

              {/* ── Aside ────────────────────────────────────────── */}
              <aside id="sounds" className="flex min-w-0 scroll-mt-f89 flex-col gap-f34">
                <LineRecordingsPanel lineId={lineId} stations={stationRefs} />

                <Link
                  href="/subway-sounds"
                  className="flex h-f55 items-center justify-center border border-ink text-label font-bold uppercase text-ink no-underline transition-colors hover:bg-ink hover:text-paper"
                >
                  All {lineId} train recordings
                </Link>

                <AdSlot size="square" />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
