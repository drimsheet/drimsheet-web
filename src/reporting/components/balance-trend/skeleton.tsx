import { Skeleton } from '@/shared/components/skeleton';
import type { BalanceTrendSkeletonProps } from './types';
export function BalanceTrendSkeleton({
  label,
}: Readonly<BalanceTrendSkeletonProps>) {
  return (
    <div aria-busy="true" className="flex min-w-0 flex-col gap-3">
      <output className="sr-only" aria-label={label} aria-busy="true">
        {label}
      </output>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
