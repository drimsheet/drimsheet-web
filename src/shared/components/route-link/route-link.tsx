import { cn } from '@/shared/lib/utils/cn';
import { Link } from 'react-router-dom';
import type { RouteLinkProps } from './types';

const colorClasses = {
  default: 'text-link',
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
  inherit: 'text-inherit',
};

const underlineClasses = {
  always: 'underline',
  hover: 'no-underline hover:underline focus-visible:underline',
  none: 'no-underline hover:no-underline focus-visible:no-underline',
};

export function RouteLink({
  color = 'default',
  underline = 'hover',
  className,
  ...props
}: Readonly<RouteLinkProps>) {
  return (
    <Link
      {...props}
      className={cn(
        'rounded-sm underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        colorClasses[color],
        underlineClasses[underline],
        className
      )}
    />
  );
}
