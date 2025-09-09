import { cn } from '@/lib/utils/cn';
import { getSubwayLineColorClasses } from '@/lib/utils/subway-colors';

interface SubwayLineBadgeProps {
  line: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeVariants = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function SubwayLineBadge({ 
  line, 
  size = 'md', 
  className 
}: SubwayLineBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center justify-center rounded font-bold',
        getSubwayLineColorClasses(line),
        sizeVariants[size],
        className
      )}
    >
      {line.toUpperCase()}
    </span>
  );
}

export default SubwayLineBadge;