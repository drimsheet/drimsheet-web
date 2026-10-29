import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CashTransferFormSkeleton() {
  const { t } = useTranslation<'journal-entries'>('journal-entries');
  const loading_status = t('cash_transfer_form_loading_status');

  return (
    <div className="w-full max-w-xl" aria-busy="true">
      <output className="sr-only">{loading_status}</output>
      <div className="flex flex-col gap-5">
        {[0, 1].map((item) => (
          <div key={item} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>

        <Skeleton className="h-4 w-36" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
