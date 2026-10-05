import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyFormSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('update_loading_text');

  return (
    <output aria-label={loading_text} className="space-y-5">
      <span className="sr-only">{loading_text}</span>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-28 ml-auto" />
    </output>
  );
}
