import type {
  IDateRangeDto,
  IPaginatedResponseIRevenueExpenseAndSuspenseAccountBalanceDto,
  IRevenueAndExpenseActivitySummaryDto,
  IRevenueExpenseAndSuspenseAccountBalanceDto,
  IRevenueExpenseSectionDto,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface CategoryHelpProps {
  label: string;
  children: ReactNode;
}

export type UCategoryTypeFilter = 'all' | 'revenue' | 'expense';

export interface CategoryPeriodProps {
  period: string;
  periods: { value: string; label: string }[];
  onPeriodChange: (value: string) => void;
}

export interface CategorySummaryProps {
  summary: IRevenueAndExpenseActivitySummaryDto;
}

export interface CategoryChartProps {
  type: 'revenue' | 'expense';
  title: string;
  description: string;
  section: IRevenueExpenseSectionDto;
  onViewAccount: (id: string) => void;
}

export interface CategoryTableProps {
  accounts?: IPaginatedResponseIRevenueExpenseAndSuspenseAccountBalanceDto;
  loading: boolean;
  search: string;
  type: UCategoryTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onViewAccount: (id: string) => void;
  onEditAccount: (account: IRevenueExpenseAndSuspenseAccountBalanceDto) => void;
  onArchiveAccount: (
    account: IRevenueExpenseAndSuspenseAccountBalanceDto
  ) => void;
}

export interface CategorySectionErrorProps {
  title: string;
}

export interface ICategoryTableRow extends IRevenueExpenseAndSuspenseAccountBalanceDto {
  id: string;
}

export interface CategoryRowActionsProps extends Pick<
  CategoryTableProps,
  'onViewAccount' | 'onEditAccount' | 'onArchiveAccount'
> {
  account: IRevenueExpenseAndSuspenseAccountBalanceDto;
}

export interface CategoryOverviewProps {
  query: IDateRangeDto;
  onViewAccount: (id: string) => void;
}

export interface CategoryArchiveConfirmationProps {
  account: IRevenueExpenseAndSuspenseAccountBalanceDto | null;
  pending: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
