import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { TriangleAlert } from 'lucide-react';
import { BalanceTrend } from './balance-trend';
import type {
  BalanceTrendErrorProps,
  BalanceTrendSkeletonProps,
  BalanceTrendWithStateProps,
} from './types';

export function BalanceTrendWithState({
  state = 'success',
  labels,
  points,
}: Readonly<BalanceTrendWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ points }}
      loading={<BalanceTrendSkeleton label={labels.loadingLabel} />}
      error={
        <BalanceTrendError
          title={labels.errorTitle}
          description={labels.errorDescription}
        />
      }
    >
      {(data) => {
        if (data.points == null) {
          return (
            <BalanceTrendError
              title={labels.errorTitle}
              description={labels.errorDescription}
            />
          );
        }

        return <BalanceTrend points={data.points} labels={labels} />;
      }}
    </WithTransitionState>
  );
}

export function BalanceTrendError({
  title,
  description,
}: Readonly<BalanceTrendErrorProps>) {
  return (
    <div className="min-h-63 min-w-0">
      <div className="flex w-full flex-col items-start gap-4">
        <Alert variant="destructive">
          <TriangleAlert aria-hidden />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export function BalanceTrendSkeleton({
  label,
}: Readonly<BalanceTrendSkeletonProps>) {
  return (
    <div aria-busy="true" className="flex min-w-0 flex-col gap-3">
      <output className="sr-only" aria-label={label} aria-busy="true">
        {label}
      </output>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
