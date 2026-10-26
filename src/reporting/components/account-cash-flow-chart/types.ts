import type { UTransitionState } from '@/shared/components/with-transition-state';
import type { IAccountCashFlowDto } from '@/shared/lib/api/Api';

export interface IAccountCashFlowChartLabels {
  moneyInLabel: string;
  moneyOutLabel: string;
  totalInLabel: string;
  totalOutLabel: string;
  dateLabel: string;
  chartLabel: string;
}

export interface AccountCashFlowChartSkeletonProps {
  'aria-label': string;
}

export interface AccountCashFlowChartProps {
  labels: IAccountCashFlowChartLabels;
  cashFlow: IAccountCashFlowDto;
}

export interface IAccountCashFlowChartStateLabels extends IAccountCashFlowChartLabels {
  loadingLabel: string;
  errorTitle: string;
  errorDescription: string;
}

export interface AccountCashFlowChartErrorProps {
  title: string;
  description: string;
}

export interface AccountCashFlowChartWithStateProps {
  state?: UTransitionState;
  labels: IAccountCashFlowChartStateLabels;
  cashFlow?: IAccountCashFlowDto | null;
}
