import { Station, StationAmenities } from '@/types/station';
import { Card, Section } from '@/components/ui';

interface StationDetailsCardProps {
  station: Station;
  amenities: StationAmenities;
  className?: string;
}

export function StationDetailsCard({ station, amenities, className }: StationDetailsCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <Section
        title={`STATION "DETAILS"`}
        icon="📋"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {amenities.stationType.replace('-', ' ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Borough:</span>
            <span className="font-semibold uppercase text-gray-900">
              {station.borough}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lines Served:</span>
            <span className="font-semibold text-gray-900">
              {station.lines.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Platforms:</span>
            <span className="font-semibold text-gray-900">
              {station.platforms.length}
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Data: MTA Static GTFS
        </p>
      </Section>
    </Card>
  );
}

export default StationDetailsCard;