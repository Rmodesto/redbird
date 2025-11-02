import { Station } from '@/types/station';
import { SubwayLineBadge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface StationHeaderProps {
  station: Station;
  serviceStatus?: 'good' | 'delayed' | 'suspended';
  className?: string;
}

const serviceStatusConfig = {
  good: {
    text: 'GOOD SERVICE',
    color: 'text-green-400',
    icon: '✓'
  },
  delayed: {
    text: 'DELAYS',
    color: 'text-yellow-400',
    icon: '⚠'
  },
  suspended: {
    text: 'SERVICE SUSPENDED',
    color: 'text-red-400',
    icon: '⨯'
  }
};

export function StationHeader({ 
  station, 
  serviceStatus = 'good',
  className 
}: StationHeaderProps) {
  const statusConfig = serviceStatusConfig[serviceStatus];

  return (
    <header className={cn('bg-black px-6 py-6', className)}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-white">
          {station.name.toUpperCase()}
        </h1>
        
        <div className="flex items-center gap-6 text-gray-400">
          <span className="uppercase">{station.borough}</span>
          
          <span className="flex items-center gap-2">
            <span className={statusConfig.color}>{statusConfig.icon}</span> 
            {statusConfig.text}
          </span>
          
          <span className="flex items-center gap-2">
            📍 {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
          </span>
        </div>
        
        <div className="mt-4 flex gap-2">
          {station.lines.map((line) => (
            <SubwayLineBadge key={line} line={line} size="lg" />
          ))}
        </div>
      </div>
    </header>
  );
}

export default StationHeader;