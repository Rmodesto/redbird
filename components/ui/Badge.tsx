import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const sizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
};

export function Badge({ 
  children, 
  className, 
  variant = 'default', 
  size = 'sm' 
}: BadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        badgeVariants[variant],
        sizeVariants[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;