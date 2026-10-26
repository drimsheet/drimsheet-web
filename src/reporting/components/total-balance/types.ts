import type { IMoneyDto } from '@/shared/lib/api/Api';
export interface IBalanceChange {
  amount: IMoneyDto;
  percentageChange: number | null;
}
export interface TotalBalanceProps {
  label: string;
  balanceLabel: string;
  comparisonLabel?: string;
  balance: IMoneyDto;
  isConverted?: boolean;
  change?: IBalanceChange;
}
