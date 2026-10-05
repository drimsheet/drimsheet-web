import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyDetailsSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('details_loading_text');

  return (
    <div className="flex flex-col gap-10" aria-busy="true">
      <output className="sr-only">{loading_text}</output>
      <Skeleton className="h-10 w-2/3" />
      <div className="grid grid-cols-3 gap-8">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-28 w-1/2" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
