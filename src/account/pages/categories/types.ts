import type {
  IDateRangeDto,
  IPaginatedResponseIRevenueExpenseAccountDto,
  IRevenueExpenseAccountDto,
  IRevenueExpenseSectionDto,
  IRevenueExpenseSummaryDto,
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
  summary: IRevenueExpenseSummaryDto;
}

export interface CategoryChartProps {
  title: string;
  description: string;
  section: IRevenueExpenseSectionDto;
  onViewAccount: (id: string) => void;
}

export interface CategoryTableProps {
  accounts?: IPaginatedResponseIRevenueExpenseAccountDto;
  loading: boolean;
  search: string;
  type: UCategoryTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onViewAccount: (id: string) => void;
  onEditAccount: (account: IRevenueExpenseAccountDto) => void;
  onArchiveAccount: (account: IRevenueExpenseAccountDto) => void;
}

export interface CategorySectionErrorProps {
  title: string;
  onRetry: () => void;
}

export interface ICategoryTableRow extends IRevenueExpenseAccountDto {
  id: string;
}

export interface CategoryRowActionsProps extends Pick<
  CategoryTableProps,
  'onViewAccount' | 'onEditAccount' | 'onArchiveAccount'
> {
  account: IRevenueExpenseAccountDto;
}

export interface CategoryOverviewProps {
  query: IDateRangeDto;
  onViewAccount: (id: string) => void;
}

export interface CategoryArchiveConfirmationProps {
  account: IRevenueExpenseAccountDto | null;
  pending: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
