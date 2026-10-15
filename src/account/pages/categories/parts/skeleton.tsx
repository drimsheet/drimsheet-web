import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CategoriesSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('categories_loading_label');

  return (
    <div
      role="status"
      aria-label={loading_label}
      className="flex flex-col gap-4"
    >
      <span className="sr-only">{loading_label}</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-56 rounded-xl md:h-36" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
