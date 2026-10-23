import { Field, FieldGroup } from '@/shared/components/field';
import { Skeleton } from '@/shared/components/skeleton';
import type { CounterpartyAddressFieldsSkeletonProps } from './types';

export function CounterpartyAddressFieldsSkeleton({
  showPostalCode = false,
}: Readonly<CounterpartyAddressFieldsSkeletonProps>) {
  return (
    <div aria-busy="true">
      <FieldGroup className="gap-5">
        <Field>
          <Skeleton className="h-4 w-full max-w-24" />
          <Skeleton className="h-9 w-full" />
        </Field>
        <Field>
          <Skeleton className="h-9 w-full" />
        </Field>
        <Field>
          <Skeleton className="h-4 w-full max-w-24" />
          <Skeleton className="h-9 w-full" />
        </Field>
        {showPostalCode && (
          <Field>
            <Skeleton className="h-4 w-full max-w-28" />
            <Skeleton className="h-9 w-full" />
          </Field>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[0, 1].map((field) => (
            <Field key={field}>
              <Skeleton className="h-4 w-full max-w-20" />
              <Skeleton className="h-9 w-full" />
            </Field>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
