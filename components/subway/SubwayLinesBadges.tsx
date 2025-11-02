'use client';

import { cn } from '@/lib/utils';

// MTA Official Line Colors
const MTA_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183',
} as const;

interface SubwayLinesBadgesProps {
  lines: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
  showCount?: boolean;
}

export const SubwayLinesBadges = ({
  lines,
  size = 'md',
  variant = 'default',
  className,
  showCount = false
}: SubwayLinesBadgesProps) => {
  if (!lines || lines.length === 0) {
    return (
      <div className={cn('text-gray-500 text-sm', className)}>
        No lines available
      </div>
    );
  }

  // Remove duplicates and sort lines
  const uniqueLines = Array.from(new Set(lines)).sort((a, b) => {
    // Sort numbered lines first, then lettered lines
    const aNum = /^\d+$/.test(a);
    const bNum = /^\d+$/.test(b);
    
    if (aNum && !bNum) return -1;
    if (!aNum && bNum) return 1;
    
    return a.localeCompare(b);
  });

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const compactSizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-2.5 py-1.5 text-base'
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {uniqueLines.map((line) => (
          <span
            key={line}
            className={cn(
              'inline-flex items-center justify-center rounded text-white font-bold',
              compactSizeClasses[size]
            )}
            style={{ 
              backgroundColor: MTA_COLORS[line as keyof typeof MTA_COLORS] || '#808183' 
            }}
          >
            {line}
          </span>
        ))}
        {showCount && (
          <span className="text-xs text-gray-500 ml-1">
            ({uniqueLines.length} line{uniqueLines.length !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {uniqueLines.map((line) => (
        <span
          key={line}
          className={cn(
            'inline-flex items-center justify-center rounded-full text-white font-bold',
            sizeClasses[size]
          )}
          style={{ 
            backgroundColor: MTA_COLORS[line as keyof typeof MTA_COLORS] || '#808183' 
          }}
          title={`${line} Line`}
        >
          {line}
        </span>
      ))}
      {showCount && (
        <span className="text-xs text-gray-500 self-center">
          {uniqueLines.length} line{uniqueLines.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default SubwayLinesBadges;