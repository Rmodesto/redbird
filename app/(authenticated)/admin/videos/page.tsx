import stationsData from '@/data/stations-normalized.json';
import VideosAdminClient from '@/components/admin/VideosAdminClient';

export const dynamic = 'force-dynamic';

interface RawStation {
  slug: string;
  name: string;
  borough: string;
  lines: string[];
}

// The @SubwaySounds channel id (resolved from the handle). Editable in the UI.
const DEFAULT_CHANNEL_ID = 'UCteXdWuT-IRRAVCg8ofeZBw';

export default function AdminVideosPage() {
  const stations = (stationsData as RawStation[])
    .filter((s) => s.slug)
    .map((s) => ({ slug: s.slug, name: s.name, borough: s.borough, lines: s.lines || [] }));

  return <VideosAdminClient stations={stations} defaultChannelId={DEFAULT_CHANNEL_ID} />;
}
