import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { AccountCashFlowChart } from './account-cash-flow-chart';
import type {
  AccountCashFlowChartErrorProps,
  AccountCashFlowChartSkeletonProps,
  AccountCashFlowChartWithStateProps,
} from './types';

export function AccountCashFlowChartWithState({
  state = 'success',
  labels,
  cashFlow,
}: Readonly<AccountCashFlowChartWithStateProps>) {
  const error = (
    <AccountCashFlowChartError
      title={labels.errorTitle}
      description={labels.errorDescription}
    />
  );

  return (
    <WithTransitionState
      state={state}
      data={{ cashFlow }}
      loading={
        <AccountCashFlowChartSkeleton aria-label={labels.loadingLabel} />
      }
      error={error}
    >
      {(data) => {
        if (data.cashFlow == null) {
          return error;
        }

        return (
          <AccountCashFlowChart cashFlow={data.cashFlow} labels={labels} />
        );
      }}
    </WithTransitionState>
  );
}

export function AccountCashFlowChartError({
  title,
  description,
}: Readonly<AccountCashFlowChartErrorProps>) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function AccountCashFlowChartSkeleton({
  'aria-label': label,
}: Readonly<AccountCashFlowChartSkeletonProps>) {
  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={label} aria-busy="true">
        {label}
      </output>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          <Skeleton className="h-16 w-36" />
          <Skeleton className="h-16 w-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
