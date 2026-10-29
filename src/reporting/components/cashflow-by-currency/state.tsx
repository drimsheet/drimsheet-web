import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import { CashflowByCurrency } from './cashflow-by-currency';
import type {
  CashflowByCurrencySkeletonProps,
  CashflowByCurrencyWithStateProps,
} from './types';

export function CashflowByCurrencyError() {
  const { t } = useTranslation('shared');
  const error_text = t('an_error_occurred');

  return (
    <p role="alert" className="text-sm text-destructive">
      {error_text}
    </p>
  );
}

export function CashflowByCurrencySkeleton({
  'aria-label': loadingLabel,
}: Readonly<CashflowByCurrencySkeletonProps>) {
  return (
    <div className="flex w-fit flex-none items-center gap-4" aria-busy="true">
      <output className="sr-only">{loadingLabel}</output>
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

export function CashflowByCurrencyWithState({
  state = 'success',
  in: moneyIn,
  out: moneyOut,
  loadingLabel,
}: Readonly<CashflowByCurrencyWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ moneyIn, moneyOut }}
      loading={<CashflowByCurrencySkeleton aria-label={loadingLabel} />}
      error={<CashflowByCurrencyError />}
    >
      {({ moneyIn, moneyOut }) => {
        if (moneyIn == null || moneyOut == null) {
          return <CashflowByCurrencyError />;
        }

        return <CashflowByCurrency in={moneyIn} out={moneyOut} />;
      }}
    </WithTransitionState>
  );
}
