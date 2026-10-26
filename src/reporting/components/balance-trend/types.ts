import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IMoneyDto } from '@/shared/lib/api/Api';
export interface IBalanceTrendPoint {
  date: string;
  amount: IMoneyDto;
}
export interface IBalanceTrendLabels {
  chartLabel: string;
  balanceLabel: string;
  dateLabel: string;
  dataLabel: string;
  emptyTitle: string;
  inactiveTitle: string;
  emptyDescription: string;
}
export interface IBalanceTrendStateLabels extends IBalanceTrendLabels {
  loadingLabel: string;
  errorTitle: string;
  errorDescription: string;
}
export interface BalanceTrendSkeletonProps {
  label: string;
}
export interface BalanceTrendErrorProps {
  title: string;
  description: string;
}
export interface BalanceTrendProps {
  labels: IBalanceTrendLabels;
  points: IBalanceTrendPoint[];
}
export interface BalanceTrendWithStateProps {
  labels: IBalanceTrendStateLabels;
  state?: UTransitionState;
  points?: IBalanceTrendPoint[] | null;
}
