import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function SubAccountsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_sub_accounts');

  return (
    <div role="status" aria-label={loading_label} aria-busy="true">
      <div className="flex flex-col gap-6 bg-muted p-6">
        <Skeleton className="h-5 w-40" />
        {[0, 1].map((row) => (
          <div key={row} className="flex justify-between gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
