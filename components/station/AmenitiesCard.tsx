import { StationAmenities } from '@/types/station';
import { Card, Section } from '@/components/ui';

interface AmenitiesCardProps {
  amenities: StationAmenities;
  className?: string;
}

interface AmenityItemProps {
  icon: string;
  label: string;
  available: boolean;
}

function AmenityItem({ icon, label, available }: AmenityItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-700">
        <span>{icon}</span> {label}
      </span>
      <span className={available ? 'text-green-400' : 'text-red-400'}>
        {available ? '✓' : '✗'}
      </span>
    </div>
  );
}

export function AmenitiesCard({ amenities, className }: AmenitiesCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <Section
        title={`ACCESSIBILITY & "AMENITIES"`}
        icon="♿"
      >
        <div className="space-y-3">
          <AmenityItem
            icon="♿"
            label="ADA Accessible"
            available={amenities.ada}
          />
          <AmenityItem
            icon="🛗"
            label="Elevators"
            available={amenities.elevators}
          />
          <AmenityItem
            icon="🚻"
            label="Restrooms"
            available={amenities.restrooms}
          />
          <AmenityItem
            icon="👮"
            label="Police Presence"
            available={amenities.policePresence}
          />
          <AmenityItem
            icon="📶"
            label="WiFi"
            available={amenities.wifi}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">🏛️ Built:</span>
            <span className="font-bold text-gray-900">{amenities.yearBuilt}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Data: MTA Accessibility
        </p>
      </Section>
    </Card>
  );
}

export default AmenitiesCard;