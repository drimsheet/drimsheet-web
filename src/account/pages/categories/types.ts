import type {
  ILedgerAccountDto,
  IMoneyDto,
  IPaginatedResponseILedgerAccountDto,
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
  summary: {
    revenue: IMoneyDto;
    expenses: IMoneyDto;
    uncategorized: IMoneyDto;
  };
}

export interface CategoryChartProps {
  type: 'revenue' | 'expense';
  title: string;
  description: string;
  section: IRevenueExpenseSectionDto;
  onViewAccount: (id: string) => void;
}

export interface CategoryTableProps {
  accounts?: IPaginatedResponseILedgerAccountDto;
  loading: boolean;
  search: string;
  type: UCategoryTypeFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onViewAccount: (id: string) => void;
  onEditAccount: (account: TCategoryAccount) => void;
  onArchiveAccount: (account: TCategoryAccount) => void;
}

export interface CategorySectionErrorProps {
  title: string;
}

export type TCategoryAccount = Pick<
  IRevenueExpenseAndSuspenseAccountBalanceDto,
  'accountId' | 'accountName' | 'code' | 'subType' | 'status' | 'amount'
> &
  Pick<ILedgerAccountDto, 'type'>;

export interface ICategoryTableRow extends TCategoryAccount {
  id: string;
}

export interface CategoryRowActionsProps extends Pick<
  CategoryTableProps,
  'onViewAccount' | 'onEditAccount' | 'onArchiveAccount'
> {
  account: TCategoryAccount;
  checking: boolean;
  eligibilityFailed: boolean;
  canDelete: boolean;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export interface CategoryArchiveConfirmationProps {
  account: TCategoryAccount | null;
  pending: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
