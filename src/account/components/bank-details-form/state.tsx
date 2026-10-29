import { Field, FieldGroup } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import { BankSelectionSkeleton } from './parts/bank-selection';
import type { BankDetailsFormSkeletonProps } from './types';

export function BankDetailsFormSkeleton({
  mode = 'create',
  showCancel = false,
  showSkipOpeningBalance = true,
  showExchangeRate = false,
}: Readonly<BankDetailsFormSkeletonProps>) {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('update_loading_text');

  return (
    <div aria-busy="true" className="w-full">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <FieldGroup
        aria-hidden="true"
        className={cn('gap-8', mode === 'create' && 'md:gap-12')}
      >
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1].map((field) => (
              <Field key={field}>
                <Skeleton className="h-3.5 w-full max-w-28" />
                <Skeleton className="h-9 w-full" />
              </Field>
            ))}
          </div>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              {[0, 1].map((field) => (
                <Field key={field}>
                  <Skeleton className="h-3.5 w-full max-w-28" />
                  <Skeleton className="h-9 w-full" />
                </Field>
              ))}
            </div>
            {showSkipOpeningBalance && (
              <Field orientation="horizontal">
                <Skeleton className="size-4" />
                <Skeleton className="h-3.5 w-56" />
              </Field>
            )}
            {showExchangeRate && (
              <Field className="min-h-[76px]">
                <Skeleton className="h-3.5 w-full max-w-28" />
                <Skeleton className="h-9 w-full" />
              </Field>
            )}
          </FieldGroup>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-52" />
          </div>
          <BankSelectionSkeleton />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1].map((field) => (
              <Field key={field}>
                <Skeleton className="h-3.5 w-full max-w-28" />
                <Skeleton className="h-9 w-full" />
              </Field>
            ))}
          </div>
        </div>
        <Field orientation="horizontal" className="justify-end">
          {showCancel && <Skeleton className="h-9 w-20" />}
          <Skeleton
            className={cn('h-9', showCancel ? 'w-28' : 'w-full sm:w-28')}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
