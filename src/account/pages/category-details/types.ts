import type {
  IAccountCounterpartyParticipationDto,
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
  actions?: ReactNode;
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

export interface CategoryDeleteConfirmationProps {
  accountName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}

export interface CategoryActionsContainerProps {
  account: ILedgerAccountDto;
}

export interface CategoryTrendProps {
  months: ICategoryMonth[];
  currencyCode: string;
  type: 'revenue' | 'expense';
}

export interface CounterpartyShareProps {
  type: 'revenue' | 'expense';
  counterparties: IAccountCounterpartyParticipationDto[];
  pagination?: IPaginationResponseMeta;
  loading: boolean;
  error: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (participation: IAccountCounterpartyParticipationDto) => void;
}

export interface CounterpartyShareContainerProps extends Pick<
  CounterpartyShareProps,
  'selectedId' | 'onSelect' | 'type'
> {
  accountId: string;
}

export interface CategoryTransactionsProps {
  transactions: ICategoryTransaction[];
  selectedCounterparty: string | null;
  onClearCounterparty: () => void;
  transactionsHref?: string;
}

export interface SectionErrorProps {
  onRetry: () => void;
}
