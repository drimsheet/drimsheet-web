import { Skeleton } from '@/shared/components/skeleton';
import type { AccountCashFlowChartSkeletonProps } from './types';

export function AccountCashFlowChartSkeleton({
  'aria-label': label,
}: Readonly<AccountCashFlowChartSkeletonProps>) {
  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={label} aria-busy="true">
        {label}
      </output>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          <Skeleton className="h-16 w-36" />
          <Skeleton className="h-16 w-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
