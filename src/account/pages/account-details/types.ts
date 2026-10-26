import type {
  IAccountCashFlowDto,
  IBankDetails,
  IJournalEntryListDto,
  ILedgerAccountDto,
  IPaginationResponseMeta,
} from '@/shared/lib/api/Api';
import type { ComponentProps } from 'react';

export interface LedgerAccountSummaryProps {
  account: Pick<ILedgerAccountDto, 'balance' | 'functionalBalance'>;
  hasSubAccounts?: boolean;
}

export interface AccountHeaderProps {
  account: Pick<ILedgerAccountDto, 'name' | 'status'>;
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

export interface CashFlowPeriodProps {
  period: string;
  periods: IPeriodOption[];
  onPeriodChange: (period: string) => void;
}

export interface RecentTransactionsContainerProps {
  accountId?: string;
  loading?: boolean;
}

export interface RecentTransactionsProps {
  accountId: string;
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
}

export type AccountCashFlowChartRangeProps = Pick<
  IAccountCashFlowDto,
  'period' | 'currencyCode'
>;

export interface AccountOverviewContainerProps {
  account: ILedgerAccountDto;
}

export interface AccountOverviewProps {
  account: ILedgerAccountDto;
  hasSubAccounts: boolean;
}
