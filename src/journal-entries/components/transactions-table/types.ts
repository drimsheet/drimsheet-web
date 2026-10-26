import type {
  EJournalEntrySourceType,
  IJournalEntryListDto,
  IMoneyDto,
  IPaginationResponseMeta,
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
  archiving?: boolean;
  onArchiveTransaction?: (entry: IJournalEntryListDto) => Promise<void>;
  onDeleteTransaction?: (entry: IJournalEntryListDto) => Promise<void>;
  pagination?: IPaginationResponseMeta;
  onEditTransaction?: (entry: IJournalEntryListDto) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (
    key: 'effectiveDate',
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
