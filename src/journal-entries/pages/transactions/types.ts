import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IMoneyDto } from '@/shared/lib/api/Api';

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

export interface ITransactionActivityDay {
  date: string;
  in: IMoneyDto;
  out: IMoneyDto;
  revenue: number;
  expense: number;
}

export interface TransactionActivityChartProps {
  days: ITransactionActivityDay[];
  currencyCode: string;
}

export interface TransactionActivityChartWithStateProps {
  state: UTransitionState;
  days?: ITransactionActivityDay[];
  currencyCode?: string;
}

export interface TransactionActivityProps {
  date: Date;
  today: Date;
  onDateChange: (date: Date) => void;
  state: UTransitionState;
  days?: ITransactionActivityDay[];
  currencyCode?: string;
}
