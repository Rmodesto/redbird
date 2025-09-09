import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  valueColor?: 'default' | 'success' | 'warning' | 'error';
}

const valueColors = {
  default: 'text-gray-900',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
  valueColor = 'default'
}: StatCardProps) {
  return (
    <Card variant="elevated" className={cn('text-center', className)}>
      {icon && (
        <div className="mb-3 flex justify-center">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        
        <div className={cn('text-3xl font-bold', valueColors[valueColor])}>
          {value}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        
        {trend && trendValue && (
          <div className={cn('text-sm font-medium', trendColors[trend])}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;