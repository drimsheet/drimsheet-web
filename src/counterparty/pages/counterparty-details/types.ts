import type {
  ICounterpartyAccountTypeParticipationDto,
  IJournalEntryListDto,
} from '@/shared/lib/api/Api';

export interface RecentTransactionsProps {
  counterpartyName: string;
  empty: boolean;
  transactions: IJournalEntryListDto[];
  loading: boolean;
  search: string;
  sortDirection: 'asc' | 'desc';
  total?: number;
  transactionsHref: string;
  onSearchChange: (search: string) => void;
  onSortChange: (key: string, direction: 'asc' | 'desc' | null) => void;
}

export interface OverviewProps {
  participation: ICounterpartyAccountTypeParticipationDto;
}

export interface OverviewWithStateProps {
  loading: boolean;
  error: boolean;
  participation?: ICounterpartyAccountTypeParticipationDto;
}

export interface OverviewContainerProps {
  counterpartyId?: string;
}
