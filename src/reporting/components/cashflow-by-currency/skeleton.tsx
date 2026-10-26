import { Skeleton } from '@/shared/components/skeleton';
import type { CashflowByCurrencySkeletonProps } from './types';

export function CashflowByCurrencySkeleton({
  'aria-label': loadingLabel,
}: Readonly<CashflowByCurrencySkeletonProps>) {
  return (
    <div className="flex w-fit flex-none items-center gap-4" aria-busy="true">
      <output className="sr-only">{loadingLabel}</output>
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}
