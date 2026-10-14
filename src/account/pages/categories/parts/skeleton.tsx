import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CategoriesSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('categories_loading_label');

  return (
    <div
      role="status"
      aria-label={loading_label}
      className="flex flex-col gap-10 md:gap-14"
    >
      <span className="sr-only">{loading_label}</span>
      <div className="grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
