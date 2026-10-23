import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function EntityDetailsSkeleton() {
  const { t } = useTranslation('accounting');
  const loading_label = t('details_loading_label');

  return (
    <div className="flex flex-col gap-6">
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
