import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { DashboardSkeletonProps } from '../types';

export function DashboardSkeleton({
  section,
}: Readonly<DashboardSkeletonProps>) {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t(`dashboard_loading_${section}`);

  return (
    <output aria-label={loading_label} className="w-full" aria-busy="true">
      {section === 'summary' && (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full max-w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      )}
      {section === 'history' && (
        <div className="flex h-56 flex-col justify-between gap-5 py-6">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      )}
      {section === 'breakdown' && (
        <div className="flex flex-col gap-6 py-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      )}
    </output>
  );
}
