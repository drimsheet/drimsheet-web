import { CounterpartyAddressFieldsSkeleton } from '@/counterparty/components/counterparty-address-fields';
import { CounterpartyTypeSelectSkeleton } from '@/counterparty/components/counterparty-type-select';
import {
  Field,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import type { ContractorFormSkeletonProps } from './types';

export function ContractorFormSkeleton({
  showPostalCode = false,
  showDisplayName = true,
}: Readonly<ContractorFormSkeletonProps>) {
  const { t } = useTranslation('counterparty');
  const loading_text = t('contractor_form_loading_text');

  const optional_fields_separator = t('optional_fields_separator');

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
          <FieldSeparator className="my-3">
            {optional_fields_separator}
          </FieldSeparator>
          {showDisplayName && (
            <Field>
              <Skeleton className="h-4 w-full max-w-32" />
              <Skeleton className="h-9 w-full" />
            </Field>
          )}
          <CounterpartyAddressFieldsSkeleton showPostalCode={showPostalCode} />
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-9 w-28" />
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
