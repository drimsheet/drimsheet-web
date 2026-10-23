import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function LegalEntityListSkeleton() {
  const { t } = useTranslation('accounting');
  const loading_label = t('legal_entities_loading_label');

  return (
    <div className="flex flex-col gap-6">
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      {[0, 1, 2].map((row) => (
        <div key={row} aria-hidden className="flex items-center gap-4 py-3">
          <Skeleton className="size-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
