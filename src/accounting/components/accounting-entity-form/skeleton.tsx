import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function AccountingEntityFormSkeleton() {
  const { t } = useTranslation('accounting');
  const loading_status = t('entity_form_loading_status');

  return (
    <div aria-busy="true" className="w-full">
      <output className="sr-only">{loading_status}</output>
      <div aria-hidden className="flex flex-col gap-5">
        {['type', 'name', 'country', 'currency'].map((field) => (
          <div key={field} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
