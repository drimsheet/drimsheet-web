import { WithTransitionState } from '@/shared/components/with-transition-state';
import { CashflowByCurrency } from './cashflow-by-currency';
import { CashflowByCurrencyError } from './error';
import { CashflowByCurrencySkeleton } from './skeleton';
import type { CashflowByCurrencyWithStateProps } from './types';

export { CashflowByCurrencyError } from './error';
export { CashflowByCurrencySkeleton } from './skeleton';

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
