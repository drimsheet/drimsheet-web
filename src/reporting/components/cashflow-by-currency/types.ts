import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IMoneyDto } from '@/shared/lib/api/Api';

export interface CashflowByCurrencyProps {
  in: IMoneyDto;
  out: IMoneyDto;
}

export interface CashflowByCurrencySkeletonProps {
  'aria-label': string;
}

export interface CashflowByCurrencyWithStateProps {
  state?: UTransitionState;
  in?: IMoneyDto | null;
  out?: IMoneyDto | null;
  loadingLabel: string;
}
