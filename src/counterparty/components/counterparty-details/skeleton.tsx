import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyDetailsSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('details_loading_text');

  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <output className="sr-only">{loading_text}</output>
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex w-2/3 flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-14" />
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
