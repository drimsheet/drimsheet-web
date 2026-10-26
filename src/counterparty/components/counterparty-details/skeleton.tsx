import { AppSection } from '@/shared/components/app-section';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyDetailsSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('details_loading_text');

  const profile_details_title = t('profile_details_title');

  return (
    <div className="flex min-w-0 flex-col" aria-busy="true">
      <output className="sr-only">{loading_text}</output>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-9 w-full max-w-64" />
            <Skeleton className="h-5 w-32 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </header>
      <AppSection title={profile_details_title}>
        <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((field) => (
            <div key={field} className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-5 w-28 max-w-full" />
              <Skeleton className="h-5 w-40 max-w-full" />
            </div>
          ))}
        </div>
      </AppSection>
    </div>
  );
}
