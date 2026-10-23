import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { ContractorFormSkeletonProps } from './types';

export function ContractorFormSkeleton({
  showPostalCode = false,
  showDisplayName = true,
}: Readonly<ContractorFormSkeletonProps>) {
  const { t } = useTranslation('counterparty');
  const loading_text = t('contractor_form_loading_text');

  return (
    <div className="space-y-5">
      <output className="sr-only" aria-label={loading_text}>
        {loading_text}
      </output>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-full" />
      {showDisplayName && (
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full" />
        </div>
      )}
      <div className="space-y-4 border-t pt-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        {showPostalCode && <Skeleton className="h-9 w-full" />}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-28 ml-auto" />
    </div>
  );
}
