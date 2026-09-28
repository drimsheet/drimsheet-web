import type {
  EJournalEntrySourceType,
  IJournalEntryListDto,
  IMoneyDto,
  IPaginationResponseMeta,
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
  amount: IMoneyDto;
  destinationAccountName?: string;
  direction: UTransactionsTableDirection;
  effectiveDate: string;
  entry: IJournalEntryListDto;
  firstCategoryName?: string;
  firstCounterpartyName?: string;
  sourceAccountName?: string;
  summary: null;
}

export interface TransactionsTableProps {
  actionButton?: ReactNode;
  data: IJournalEntryListDto[];
  loading?: boolean;
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
  searchValue?: string;
  onSearchChange: (value: string) => void;
}
