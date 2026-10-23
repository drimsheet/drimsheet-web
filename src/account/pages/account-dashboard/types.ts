import type {
  IAssetLiabilityAccountParticipationDto,
  IAssetLiabilitySummaryDto,
  IMoneyDto,
  IPaginatedResponseIAssetLiabilityAccountParticipationDto,
} from '@/shared/lib/api/Api';

export type UAccountTypeFilter = 'all' | 'asset' | 'liability';
export type UBalancePeriod = '1M' | '6M' | '1Y';

export interface IAccountTableRow extends IAssetLiabilityAccountParticipationDto {
  id: string;
}

export interface IBalancePoint {
  date: string;
  amount: IMoneyDto;
}

export interface AccountsSummaryProps {
  summary: IAssetLiabilitySummaryDto;
}

export interface AccountBreakdownProps {
  type: 'asset' | 'liability';
  accounts: IAssetLiabilityAccountParticipationDto[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onViewAccount: (id: string) => void;
}

export interface AccountsTableProps {
  accounts?: IPaginatedResponseIAssetLiabilityAccountParticipationDto;
  loading: boolean;
  error: boolean;
  search: string;
  type: UAccountTypeFilter;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddAccount: () => void;
  onViewAccount: (id: string) => void;
}

export interface BalanceTrendProps {
  points: IBalancePoint[];
}

export interface BalanceHistoryContainerProps {
  period: UBalancePeriod;
  onPeriodChange: (period: UBalancePeriod) => void;
  summary?: IAssetLiabilitySummaryDto;
  enabled: boolean;
  summaryError: boolean;
}

export interface DashboardSkeletonProps {
  section: 'summary' | 'history' | 'breakdown';
}

export interface DashboardErrorProps {
  title: string;
}

export interface AccountPageEmptyStateProps {
  onAddAccount: () => void;
}
