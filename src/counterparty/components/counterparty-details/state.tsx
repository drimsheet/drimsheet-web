import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyDetailsSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('details_loading_text');

  return (
    <div className="flex min-w-0 flex-col" aria-busy="true">
      <output className="sr-only">{loading_text}</output>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {[0, 1].map((field) => (
          <div key={field} className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-5 w-28 max-w-full" />
            <Skeleton className="h-5 w-40 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
