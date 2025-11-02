import { Station } from '@/types/station';
import { Card, Section, Button } from '@/components/ui';

interface SubwaySoundsCardProps {
  station: Station;
  className?: string;
}

const soundCategories = [
  { id: 'arrivals', label: 'TRAIN ARRIVALS & DEPARTURES', icon: 'T' },
  { id: 'announcements', label: 'STATION ANNOUNCEMENTS', icon: '📢' },
  { id: 'ambient', label: 'AMBIENT STATION SOUNDS', icon: '🎵' },
];

export function SubwaySoundsCard({ station, className }: SubwaySoundsCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <Section
        title={`SUBWAY "SOUNDS"`}
        icon="🔊"
      >
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-6">
            Audio recordings from {station.name.toUpperCase()} station coming soon!
          </p>
          
          <div className="space-y-3">
            {soundCategories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                fullWidth
                className="justify-start gap-3"
              >
                <span className={typeof category.icon === 'string' && category.icon.length === 1 ? 'text-2xl font-bold' : 'text-2xl'}>
                  {category.icon}
                </span>
                <span className="font-semibold">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Section>
    </Card>
  );
}

export default SubwaySoundsCard;