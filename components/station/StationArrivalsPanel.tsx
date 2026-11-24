'use client';

import { useCallback, useEffect, useState } from 'react';
import SubwayLineBadge from '@/components/ui/SubwayLineBadge';

interface Arrival {
  line: string;
  direction: string;
  destination: string;
  /** The arrivals API returns `minutesUntil`; `types/station.ts` calls the same
   *  value `minutesAway`. Accept either so the panel works against both. */
  minutesUntil?: number;
  minutesAway?: number;
  /** Unix seconds. Authoritative — the API currently clamps minutesUntil to 0
   *  for trains whose time has already passed, so we derive from this instead. */
  arrivalTime?: number;
}

/** Minutes from now, derived from arrivalTime when present. Negative = departed. */
function minutesFromNow(a: Arrival): number | null {
  if (typeof a.arrivalTime === 'number') {
    return Math.round((a.arrivalTime * 1000 - Date.now()) / 60000);
  }
  const given = a.minutesUntil ?? a.minutesAway;
  return typeof given === 'number' ? given : null;
}

interface StationArrivalsPanelProps {
  stationId: string;
}

function agoLabel(from: Date | null): string {
  if (!from) return '';
  const secs = Math.max(0, Math.round((Date.now() - from.getTime()) / 1000));
  if (secs < 60) return `Updated ${secs}s ago`;
  return `Updated ${Math.round(secs / 60)}m ago`;
}

export default function StationArrivalsPanel({ stationId }: StationArrivalsPanelProps) {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  // Re-render the "updated Ns ago" label without refetching.
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/arrivals/${stationId}`);
      if (!res.ok) throw new Error('bad status');
      const json = await res.json();
      setArrivals(json.arrivals ?? []);
      setUpdated(json.lastUpdated ? new Date(json.lastUpdated) : new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    load();
    const refresh = setInterval(load, 30_000);
    const label = setInterval(() => tick((n) => n + 1), 10_000);
    return () => {
      clearInterval(refresh);
      clearInterval(label);
    };
  }, [load]);

  // Drop trains whose arrival time has already passed — the feed keeps returning
  // them with minutesUntil clamped to 0, which would read as "arriving now".
  const next = arrivals
    .map((a) => ({ a, mins: minutesFromNow(a) }))
    .filter((x) => x.mins !== null && x.mins >= 0)
    .sort((x, y) => (x.mins as number) - (y.mins as number))
    .slice(0, 5);

  return (
    <div className="border border-station-ink">
      <div className="flex h-[34px] items-center justify-between bg-station-panel px-[13px] text-white">
        <span className="text-[13px] font-bold tracking-[.08em]">&ldquo;Live&rdquo; Arrivals</span>
        <span className="text-[10px] font-bold uppercase tracking-[.08em] text-station-dim">
          {error ? 'Unavailable' : agoLabel(updated)}
        </span>
      </div>

      {loading && (
        <div className="border-t border-station-rule p-[13px] text-[13px] leading-[21px] text-station-muted">
          Loading arrivals…
        </div>
      )}

      {!loading && error && (
        <div className="border-t border-station-rule p-[13px] text-[13px] leading-[21px] text-station-muted">
          Arrival data is unavailable right now.
        </div>
      )}

      {!loading && !error && next.length === 0 && (
        <div className="border-t border-station-rule p-[13px] text-[13px] leading-[21px] text-station-muted">
          No trains currently scheduled.
        </div>
      )}

      {next.map(({ a, mins }, i) => (
        <div
          key={`${a.line}-${a.destination}-${i}`}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[13px] border-t border-station-rule p-[13px]"
        >
          <SubwayLineBadge line={a.line} size="md" />
          <span className="flex min-w-0 flex-col gap-[3px]">
            <span className="truncate text-[16px] font-bold leading-[21px] text-station-ink">
              {a.destination}
            </span>
            <span className="text-[13px] leading-[21px] text-station-muted">{a.direction}</span>
          </span>
          {mins === 0 ? (
            <span className="text-[16px] font-bold uppercase leading-[34px] tracking-[.08em] text-station-ink">
              Due
            </span>
          ) : (
            <span className="text-[26px] font-bold leading-[34px] tabular-nums text-station-ink">
              {mins}
              <span className="text-[13px] text-station-muted"> min</span>
            </span>
          )}
        </div>
      ))}

      <div className="border-t border-station-rule px-[13px] py-[8px] text-[13px] leading-[21px] text-station-muted">
        Data: MTA GTFS-Realtime
      </div>
    </div>
  );
}
