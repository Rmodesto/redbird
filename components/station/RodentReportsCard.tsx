import { RodentReports } from '@/types/station';
import { StatCard } from '@/components/ui';

interface RodentReportsCardProps {
  rodentReports: RodentReports;
  className?: string;
}

export function RodentReportsCard({ rodentReports, className }: RodentReportsCardProps) {
  const getValueColor = (count: number) => {
    if (count === 0) return 'success';
    if (count <= 5) return 'warning';
    return 'error';
  };

  return (
    <StatCard
      title={`RODENT "REPORTS"`}
      value={rodentReports.count}
      subtitle={`311 COMPLAINTS (${rodentReports.year})`}
      valueColor={getValueColor(rodentReports.count)}
      trend={rodentReports.trend}
      icon={<span className="text-2xl">🐀</span>}
      className={className}
    />
  );
}

export default RodentReportsCard;