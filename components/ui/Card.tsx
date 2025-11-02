import { ReactNode, forwardRef, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  asChild?: boolean;
}

const cardVariants = {
  default: 'bg-white border border-gray-200',
  outlined: 'bg-white border-2 border-gray-300',
  elevated: 'bg-white shadow-lg border border-gray-200',
};

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  className, 
  variant = 'default', 
  padding = 'md',
  hover = false,
  asChild = false,
  ...props
}, ref) => {
  const classes = cn(
    'rounded-lg',
    cardVariants[variant],
    paddingVariants[padding],
    hover && 'hover:shadow-lg transition-shadow cursor-pointer',
    className
  );

  if (asChild) {
    if (isValidElement(children)) {
      return cloneElement(children, {
        className: cn(classes, children.props.className),
        ref,
        ...props,
      } as any);
    }
    return null;
  }

  return (
    <div 
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;