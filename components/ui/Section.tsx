import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export function Section({ 
  children, 
  title, 
  subtitle,
  icon,
  className,
  titleClassName,
  contentClassName 
}: SectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && (
            <h2 className={cn(
              'text-2xl font-bold flex items-center gap-3 text-gray-900',
              titleClassName
            )}>
              {icon && <span className="text-3xl">{icon}</span>}
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className={cn('space-y-4', contentClassName)}>
        {children}
      </div>
    </section>
  );
}

export default Section;