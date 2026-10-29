import type {
  EJournalEntrySourceType,
  IJournalEntryListDto,
  IMoneyDto,
  IPaginationResponseMeta,
  UJournalEntrySortBy,
  UJournalEntrySourceType,
} from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export type UTransactionsTableDirection =
  | typeof EJournalEntrySourceType.Payment
  | typeof EJournalEntrySourceType.Receipt
  | typeof EJournalEntrySourceType.Transfer;

export interface ITransactionsTableRow {
  id: string;
  action: null;
  accountName: string;
  additionalCategoryCount: number;
  additionalCounterpartyCount: number;
  amount: IMoneyDto | null;
  canOpenDetails: boolean;
  destinationAccountName?: string;
  direction: UJournalEntrySourceType;
  effectiveDate: string;
  createdAt: string;
  entry: IJournalEntryListDto;
  firstCategoryName?: string;
  firstCounterpartyName?: string;
  sourceAccountName?: string;
  summary: string | null;
}

export interface TransactionsTableProps {
  accountId?: string;
  emptyStateNode?: ReactNode;
  data: IJournalEntryListDto[];
  loading?: boolean;
  sortable?: boolean;
  showRecordedOn?: boolean;
  currentSortKey?: UJournalEntrySortBy;
  filter?: JournalEntryTableFilterProps;
  error?: boolean;
  archiving?: boolean;
  onArchiveTransaction?: (entry: IJournalEntryListDto) => Promise<void>;
  onDeleteTransaction?: (entry: IJournalEntryListDto) => Promise<void>;
  pagination?: IPaginationResponseMeta;
  onEditTransaction?: (entry: IJournalEntryListDto) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (
    key: UJournalEntrySortBy,
    direction: 'asc' | 'desc' | null
  ) => void;
  currentSortDirection?: 'asc' | 'desc' | null;
  className?: string;
  'data-testid'?: string;
}

export type TTransactionSummaryRow = Pick<
  ITransactionsTableRow,
  | 'additionalCategoryCount'
  | 'additionalCounterpartyCount'
  | 'destinationAccountName'
  | 'direction'
  | 'firstCategoryName'
  | 'firstCounterpartyName'
  | 'sourceAccountName'
>;

export interface TransactionSummaryProps {
  row: TTransactionSummaryRow;
  onOpen?: () => void;
}

export interface IJournalEntryTableFilters {
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  recordedDateFrom?: string;
  recordedDateTo?: string;
  sourceType?: UTransactionsTableDirection;
  accountId?: string;
  categoryId?: string;
  counterpartyId?: string;
  currencyCode?: string;
}

export interface IJournalEntryFilterOption {
  value: string;
  label: string;
}

export interface IJournalEntryFilterOptions {
  accounts: IJournalEntryFilterOption[];
  categories: IJournalEntryFilterOption[];
  counterparties: IJournalEntryFilterOption[];
  currencies: IJournalEntryFilterOption[];
}

export interface JournalEntryTableFilterProps {
  value: IJournalEntryTableFilters;
  onApply: (value: IJournalEntryTableFilters) => void;
  options: IJournalEntryFilterOptions;
  optionsLoading?: boolean;
  optionsError?: boolean;
  search: string;
  onSearchChange: (search: string) => void;
}

export type UJournalEntryFilterField =
  | 'effectiveDate'
  | 'recordedDate'
  | 'sourceType'
  | 'accountId'
  | 'categoryId'
  | 'counterpartyId'
  | 'currencyCode';

export interface JournalEntryFilterOptionsProps {
  label: string;
  value?: string;
  options: IJournalEntryFilterOption[];
  onChange: (value: string | undefined) => void;
  loading?: boolean;
  error?: boolean;
  select?: boolean;
}

export interface TransactionsTableSkeletonProps {
  showRecordedOn?: boolean;
}

export interface TransactionsTableWithStateProps extends TransactionsTableSkeletonProps {
  loading: boolean;
  error: boolean;
  children: ReactNode;
}
