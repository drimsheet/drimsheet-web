import type {
  IAccountBalanceContributionsByCounterpartyDto,
  ILedgerAccountDto,
  IMoneyDto,
  IPaginationResponseMeta,
  UJournalEntryStatus,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface ICategoryMonth {
  month: string;
  amount: number;
}

export interface ICategoryTransaction {
  id: string;
  effectiveDate: string;
  description: string | null;
  counterparties: { id: string; name: string | null }[];
  amount: IMoneyDto;
  status: UJournalEntryStatus;
}

export interface CategorySummaryProps {
  account: ILedgerAccountDto;
  transactionCount?: number | null;
  intervalSlot?: ReactNode;
  balance?: IMoneyDto | null;
}

export interface CategoryActionsProps {
  accountName: string;
  onArchive: () => Promise<void>;
  archiveDisabled?: boolean;
  loading?: boolean;
  onEdit: () => void;
  editDisabled?: boolean;
  deleteEligibilityChecking?: boolean;
  deleteEligibilityFailed?: boolean;
  deletable?: boolean;
  onActionsOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
}

export interface CategoryActionsContainerProps {
  account: ILedgerAccountDto;
}

export interface CategoryTrendProps {
  hasTransactions?: boolean;
  months: ICategoryMonth[];
  currencyCode: string;
  type: 'revenue' | 'expense';
}

export interface CounterpartyShareProps {
  type: 'revenue' | 'expense';
  counterparties: IAccountBalanceContributionsByCounterpartyDto[];
  pagination?: IPaginationResponseMeta;
  loading: boolean;
  error: boolean;
  onPageChange: (page: number) => void;
  selectedId: string | null;
  onSelect: (
    participation: CounterpartyShareProps['counterparties'][number]
  ) => void;
}

export interface CounterpartyShareContainerProps extends Pick<
  CounterpartyShareProps,
  'selectedId' | 'onSelect' | 'type'
> {
  accountId: string;
  from: string;
  to: string;
}

export interface CategoryTransactionsProps {
  total: number;
  entries: import('@/shared/lib/api/Api').IJournalEntryListDto[];
  selectedCounterparty: string | null;
  onClearCounterparty: () => void;
  transactionsHref?: string;
}

export type CategoryTransactionCountProps = Pick<
  CategorySummaryProps,
  'transactionCount'
>;

export type CategoryBalanceProps = Pick<CategorySummaryProps, 'balance'>;

export interface CategoryChartsProps {
  children: ReactNode;
}

export interface CategoryTransactionsContainerProps {
  accountId: string;
  from: string;
  to: string;
  counterpartyId: string | null;
  selectedCounterparty: string | null;
  onClearCounterparty: () => void;
}

export type CategoryMetadataProps = Pick<CategorySummaryProps, 'account'>;

export interface CategoryPartWithStateProps {
  loading: boolean;
  error?: boolean;
  children: ReactNode;
}

export interface CategorySummarySkeletonProps {
  showPeriod?: boolean;
}

export interface CategorySummaryWithStateProps
  extends CategoryPartWithStateProps, CategorySummarySkeletonProps {}
