import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IMoneyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface TransactionsTableContainerProps {
  actionButton?: ReactNode;
}

export interface ICurrencyActivity {
  currencyCode: string;
  logo?: string;
  inflow: IMoneyDto;
  outflow: IMoneyDto;
}

export interface TransactionsOverviewProps {
  inflow: IMoneyDto;
  outflow: IMoneyDto;
  currencies: ICurrencyActivity[];
}

export interface TransactionsOverviewWithStateProps {
  state: UTransitionState;
  data?: TransactionsOverviewProps;
}
