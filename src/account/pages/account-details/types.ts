import type {
  IAccountCashFlowDto,
  IBankDetails,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IPaginationResponseMeta,
} from '@/shared/lib/api/Api';
import type { ComponentProps, ReactNode } from 'react';

export interface LedgerAccountSummaryProps extends ComponentProps<'div'> {
  account: ILedgerAccountDto;
  hasSubAccounts?: boolean;
  actions?: ReactNode;
}

export interface AccountActionsProps {
  archiveDisabled?: boolean;
  isControlAccount?: boolean;
  loading?: boolean;
  onArchive: () => Promise<void>;
  deleteEligibilityChecking?: boolean;
  deleteEligibilityFailed?: boolean;
  deletable?: boolean;
  onActionsOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export interface AccountDeleteConfirmationProps {
  accountName: string;
  isControlAccount: boolean;
  onDelete: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export interface AccountActionsContainerProps {
  account: ILedgerAccountDto;
}

export type AccountBehaviorLabelProps = Pick<ILedgerAccountDto, 'behavior'>;

export interface BankDetailsProps extends ComponentProps<'div'> {
  bankDetails: IBankDetails;
}

export interface AccountSectionProps {
  accountId: string;
}

export interface SubAccountsProps {
  accounts: ILedgerAccountDto[];
  onOpenAccount: (id: string) => void;
}

export interface IPeriodOption {
  value: string;
  label: string;
}

export interface TransactionsChartProps {
  cashFlow: IAccountCashFlowDto;
}

export interface CashFlowPeriodProps {
  period: string;
  periods: IPeriodOption[];
  onPeriodChange: (period: string) => void;
}

export interface RecentTransactionsProps {
  transactions: IJournalEntryListDto[];
  pagination?: IPaginationResponseMeta;
  search: string;
  empty: boolean;
  sortDirection: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (
    key: 'effectiveDate',
    direction: 'asc' | 'desc' | null
  ) => void;
}

export interface SectionErrorProps {
  title: string;
  onRetry: () => void;
}
