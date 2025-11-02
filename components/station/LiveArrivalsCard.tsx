import { LiveArrivals, TrainArrival } from '@/types/station';
import { Card, Section, SubwayLineBadge } from '@/components/ui';

interface LiveArrivalsCardProps {
  arrivals: LiveArrivals;
  className?: string;
}

export function LiveArrivalsCard({ arrivals, className }: LiveArrivalsCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <Section 
        title={`"LIVE" ARRIVALS`}
        icon="🕐"
      >
        {arrivals.arrivals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No arrival information available
          </div>
        ) : (
          <div className="space-y-4">
            {arrivals.arrivals.map((arrival, index) => (
              <ArrivalRow key={`${arrival.line}-${index}`} arrival={arrival} />
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>
            Updated every 30 seconds • Last update: {arrivals.lastUpdated.toLocaleTimeString()}
          </span>
          <span>Data: {arrivals.dataSource}</span>
        </div>
      </Section>
    </Card>
  );
}

function ArrivalRow({ arrival }: { arrival: TrainArrival }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-4">
        <SubwayLineBadge line={arrival.line} size="md" />
        <div>
          <div className="font-semibold text-gray-900">
            {arrival.destination}
          </div>
          <div className="text-sm text-gray-500 uppercase">
            {arrival.direction}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {arrival.minutesAway} min
      </div>
    </div>
  );
}

export default LiveArrivalsCard;