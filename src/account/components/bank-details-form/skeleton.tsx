import { Field, FieldGroup } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import { BankSelectionSkeleton } from './parts/bank-selection';

export function BankDetailsFormSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('update_loading_text');

  return (
    <div aria-busy="true" className="w-full max-w-2xl">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <FieldGroup aria-hidden="true" className="gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_3fr]">
          {[0, 1].map((field) => (
            <Field key={field}>
              <Skeleton className="h-4 w-full max-w-28" />
              <Skeleton className="h-9 w-full" />
            </Field>
          ))}
        </div>
        <BankSelectionSkeleton />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_3fr]">
          {[0, 1].map((field) => (
            <Field key={field}>
              <Skeleton className="h-4 w-full max-w-28" />
              <Skeleton className="h-9 w-full" />
            </Field>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <FieldGroup>
          <Field orientation="horizontal">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-56" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1].map((field) => (
              <Field key={field}>
                <Skeleton className="h-4 w-full max-w-28" />
                <Skeleton className="h-9 w-full" />
              </Field>
            ))}
          </div>
          <Field className="min-h-[76px]">
            <Skeleton className="h-4 w-full max-w-28" />
            <Skeleton className="h-9 w-full" />
          </Field>
        </FieldGroup>
        <Field orientation="horizontal" className="justify-end">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </Field>
      </FieldGroup>
    </div>
  );
}
