import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function TransactionsChartSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_transactions_chart');

  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-8">
          <Skeleton className="h-16 w-36" />
          <Skeleton className="h-16 w-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
