import { PageSection } from '@/shared/components/page-section';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function BankDetailsSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('details_loading_bank_details');

  return (
    <PageSection
      role="status"
      aria-label={loading_label}
      aria-busy="true"
      className="bg-muted px-6"
    >
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((field) => (
            <div key={field} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40 max-w-full" />
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
