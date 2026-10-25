import type { IAccountsTableRow } from '@/account/components/accounts-table';
import type {
  IAccountDashboardHistory,
  IAccountDashboardMoney,
  IAccountDashboardSummary,
} from '@/account/lib/types/account-dashboard.types';
import type { UTransitionState } from '@/shared/components/with-transition-state';

export type UBalancePeriod = '1M' | '6M' | '1Y';

export interface IAccountBalanceChange {
  amount: IAccountDashboardMoney;
  percentageChange: number | null;
  date: string;
}

export interface AccountsSummaryProps {
  summary: IAccountDashboardSummary;
  change?: IAccountBalanceChange;
}

export interface AccountsSummaryWithStateProps extends Pick<
  AccountsSummaryProps,
  'change'
> {
  state?: UTransitionState;
  summary?: IAccountDashboardSummary | null;
}

export interface BalanceHistoryProps {
  period: UBalancePeriod;
  onPeriodChange: (period: UBalancePeriod) => void;
  history?: IAccountDashboardHistory;
  loading: boolean;
  error: boolean;
}

export interface DashboardErrorProps {
  title: string;
}

export interface EmptyAccountDashboardProps {
  onAdd: () => void;
}

export interface AccountDetailsActionsProps {
  account: IAccountsTableRow;
  busy?: boolean;
  checking?: boolean;
  eligibilityFailed?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onArchive: () => Promise<void>;
  onDelete: () => void;
}
