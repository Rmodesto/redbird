import { CrimeStats } from '@/types/station';
import { Card, Section } from '@/components/ui';

interface CrimeStatsCardProps {
  crimeStats: CrimeStats;
  className?: string;
}

export function CrimeStatsCard({ crimeStats, className }: CrimeStatsCardProps) {
  return (
    <Card variant="elevated" className={className}>
      <Section
        title={`CRIME STATS (${crimeStats.year})`}
        icon="🚨"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-400">{crimeStats.felonies}</div>
            <div className="text-xs text-gray-500 uppercase">Felonies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">{crimeStats.misdemeanors}</div>
            <div className="text-xs text-gray-500 uppercase">Misdemeanors</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">{crimeStats.violations}</div>
            <div className="text-xs text-gray-500 uppercase">Violations</div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Within {crimeStats.radius} miles of station<br/>
          Data: NYC Open Data
        </p>
      </Section>
    </Card>
  );
}

export default CrimeStatsCard;