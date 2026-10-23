import { Field } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyTypeSelectSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_label = t('type_usage_checking_text');

  return (
    <Field aria-busy="true">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <Skeleton className="h-4 w-full max-w-16" aria-hidden="true" />
      <Skeleton className="h-9 w-full" aria-hidden="true" />
    </Field>
  );
}
