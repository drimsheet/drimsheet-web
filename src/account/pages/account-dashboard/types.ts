import type {
  IAccountDashboardAccounts,
  IAccountDashboardBalancePoint,
  IAccountDashboardHistory,
  IAccountDashboardMoney,
  IAccountDashboardRow,
  IAccountDashboardSummary,
} from '@/account/lib/types/account-dashboard.types';
import type { ReactNode } from 'react';

export type UAccountBehaviorFilter = 'all' | 'bank' | 'petty_cash';
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

export interface AccountsTableProps {
  accounts?: IAccountDashboardAccounts;
  loading: boolean;
  error: boolean;
  search: string;
  type: UAccountBehaviorFilter;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddAccount: () => void;
  onViewAccount: (id: string) => void;
  renderRowActions?: (account: TAccountTableRow) => ReactNode;
}

export interface BalanceTrendProps {
  points: IAccountDashboardBalancePoint[];
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

export interface AccountPageEmptyStateProps {
  onAddAccount: () => void;
}

export type TAccountTableRow = IAccountDashboardRow;

export interface AccountRowActionsProps {
  account: TAccountTableRow;
  busy?: boolean;
  checking?: boolean;
  eligibilityFailed?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onArchive: () => Promise<void>;
  onDelete: () => void;
}
