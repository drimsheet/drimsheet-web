import { Skeleton } from '@/shared/components/skeleton';

export function BalancesByCurrencySkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex flex-col gap-1">
          <dt>
            <Skeleton className="size-5 rounded-full" />
          </dt>
          <dd>
            <Skeleton className="h-5 w-24" />
          </dd>
        </div>
      ))}
    </>
  );
}
