import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function AccountSummarySkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_account_summary');

  return (
    <div role="status" aria-label={loading_label} aria-busy="true">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-4 w-28" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
    </div>
  );
}
