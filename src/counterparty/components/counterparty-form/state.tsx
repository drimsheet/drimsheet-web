import { CounterpartyTypeSelectSkeleton } from '@/counterparty/components/counterparty-type-select';
import { Field, FieldGroup, FieldSet } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';

export function CounterpartyFormSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('update_loading_text');

  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={loading_text} aria-busy="true">
        {loading_text}
      </output>
      <FieldSet aria-hidden="true">
        <FieldGroup className="gap-5">
          <Field>
            <Skeleton className="h-4 w-full max-w-24" />
            <Skeleton className="h-9 w-full" />
          </Field>
          <CounterpartyTypeSelectSkeleton />
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-9 w-28" />
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
