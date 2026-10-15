import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CategoryActivitySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('category_details_loading_label');

  return (
    <div
      role="status"
      aria-label={loading_label}
      className="flex flex-col gap-8"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
