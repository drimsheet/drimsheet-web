import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function RecentTransactionsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_recent_transactions');

  return (
    <output aria-label={loading_label} aria-busy="true">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-full" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-14 w-full" />
        ))}
      </div>
    </output>
  );
}
