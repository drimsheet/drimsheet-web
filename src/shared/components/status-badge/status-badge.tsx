import { statusBadgeVariants } from '@/shared/components/status-badge/status-badge-variants';
import { cn } from '@/shared/lib/utils/cn';
import type { StatusBadgeProps } from './types';

export function StatusBadge({
  className,
  variant = 'neutral',
  showDot = false,
  label,
  ...props
}: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {showDot && (
        <span
          data-testid="status-badge-dot"
          aria-hidden="true"
          className="size-1.5 rounded-full bg-current shrink-0"
        />
      )}
      {label}
    </span>
  );
}
