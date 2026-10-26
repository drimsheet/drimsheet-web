import { Skeleton } from '@/shared/components/skeleton';
export function TotalBalanceSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-full max-w-64" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}
