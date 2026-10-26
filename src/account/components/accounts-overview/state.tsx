import { Skeleton } from '@/shared/components/skeleton';

export function LedgerAccountsOverviewSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs"
    >
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Skeleton className="h-4 w-16 max-w-full" />
          <Skeleton className="h-5 w-24 max-w-full" />
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-end gap-0.5">
        <Skeleton className="h-6 w-20 max-w-full" />
        <Skeleton className="mt-0.5 h-4 w-32 max-w-full sm:h-5" />
      </div>
    </div>
  );
}
