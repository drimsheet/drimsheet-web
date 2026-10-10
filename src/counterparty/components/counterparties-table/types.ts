import type {
  ICounterpartyDto,
  IPaginationResponseMeta,
} from '@/shared/lib/api/Api';

export interface CounterpartiesTableProps {
  data: ICounterpartyDto[];
  archiving?: boolean;
  getCounterpartyHref?: (id: string) => string;
  loading?: boolean;
  selectable?: boolean;
  selectedRowIds?: (string | number)[];
  onRowSelectionChange?: (selectedIds: (string | number)[]) => void;
  pagination?: IPaginationResponseMeta;
  onPageChange?: (page: number) => void;
  stickyHeader?: boolean;
  onSortChange: (
    key: keyof ICounterpartyDto,
    direction: 'asc' | 'desc' | null
  ) => void;
  onFilterChange: (filters: Record<string, (string | number)[]>) => void;
  currentSortKey?: string;
  currentSortDirection?: 'asc' | 'desc' | null;
  className?: string;
  'data-testid'?: string;
  searchValue?: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, (string | number)[]>;
  onAddCounterparty: () => void;
  onArchiveCounterparty?: (counterparty: ICounterpartyDto) => Promise<void>;
  onCheckCounterpartyDeleteEligibility?: (
    counterparty: ICounterpartyDto
  ) => Promise<boolean>;
  onDeleteCounterparty?: (counterparty: ICounterpartyDto) => void;
  onEditCounterparty?: (counterparty: ICounterpartyDto) => void;
}
