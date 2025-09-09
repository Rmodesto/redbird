import { StationScore } from '@/types/station';
import { StatCard } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface StationScoreCardProps {
  score: StationScore;
  className?: string;
}

export function StationScoreCard({ score, className }: StationScoreCardProps) {
  const getScoreColor = (rating: StationScore['rating']) => {
    switch (rating) {
      case 'EXCELLENT': return 'success';
      case 'GOOD': return 'success';
      case 'FAIR': return 'warning';
      case 'POOR': return 'error';
      default: return 'default';
    }
  };

  return (
    <StatCard
      title="SCORE"
      value={`${score.score}/100`}
      subtitle={score.rating}
      valueColor={getScoreColor(score.rating)}
      className={cn('text-center', className)}
    />
  );
}

export default StationScoreCard;