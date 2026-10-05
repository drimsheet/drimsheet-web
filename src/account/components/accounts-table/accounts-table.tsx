import { Ellipsis, EqualApproximately, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ledgerAccountMapper } from '@/account/lib/mappers/account.mapper';
import { Button } from '@/shared/components/button';
import { DataTable, type ITableColumn } from '@/shared/components/data-table';
import { FormattedDate } from '@/shared/components/date';
import { Money } from '@/shared/components/money';
import { SearchField } from '@/shared/components/search-field';
import { StatusBadge } from '@/shared/components/status-badge';
import { TablePagination } from '@/shared/components/table-pagination';
import {
  ELedgerAccountStatus,
  type ILedgerAccountDto,
  type IMoneyDto,
  type IPaginationResponseMeta,
  type ULedgerAccountStatus,
} from '@/shared/lib/api/Api';
import { Link } from 'react-router-dom';

export interface LedgerAccountsTableProps {
  data: ILedgerAccountDto[];
  loading?: boolean;
  selectable?: boolean;
  selectedRowIds?: (string | number)[];
  onRowSelectionChange?: (selectedIds: (string | number)[]) => void;
  pagination?: IPaginationResponseMeta;
  onPageChange?: (page: number) => void;
  stickyHeader?: boolean;
  onSortChange: (
    key: keyof ILedgerAccountDto,
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
  onAddAccount: () => void;
}

export function LedgerAccountsTable({
  data,
  loading = false,
  selectable = false,
  selectedRowIds,
  onRowSelectionChange,
  pagination,
  onPageChange,
  stickyHeader = false,
  onSortChange,
  onFilterChange,
  currentSortKey,
  currentSortDirection,
  className,
  'data-testid': dataTestId = 'ledger-accounts-table',
  searchValue = '',
  onSearchChange,
  filters,
  onAddAccount,
}: Readonly<LedgerAccountsTableProps>) {
  const { t } = useTranslation(['ledger-accounts', 'shared']);

  const columns = useMemo<ITableColumn<ILedgerAccountDto>[]>(() => {
    const account_name_label = t('ledger-accounts:account_name');
    const balance_text = t('shared:balance');
    const status_text = t('shared:status');
    const active_label = t('shared:active');
    const archived_label = t('shared:archived');
    const created_on_label = t('shared:created_on');

    return [
      {
        dataIndex: 'name',
        title: account_name_label,
        sortable: true,
        render: (value, row) => (
          <Link
            to={row.id}
            className="hover:text-brand-primary group-hover/row:text-brand-primary transition-colors duration-200"
          >
            {String(value)}
          </Link>
        ),
      },
      {
        dataIndex: 'balance',
        title: balance_text,
        sortable: true,
        render: (value, row) => (
          <>
            <Money
              className="text-foreground text-sm font-heading"
              localCode={row.functionalBalance.currencyCode}
              value={value as IMoneyDto}
            />

            {row.functionalBalance.currencyCode !==
              row.balance.currencyCode && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <EqualApproximately className="w-3" />
                <Money
                  className="text-xs text-muted-foreground font-medium"
                  value={row.functionalBalance as IMoneyDto}
                />
              </div>
            )}
          </>
        ),
      },
      {
        dataIndex: 'status',
        title: status_text,
        sortable: true,
        filterable: true,
        filterOptions: [
          { label: active_label, value: ELedgerAccountStatus.Active },
          { label: archived_label, value: ELedgerAccountStatus.Archived },
        ],
        render: (value) => {
          const statusVal = value as ULedgerAccountStatus;

          return (
            <StatusBadge
              {...ledgerAccountMapper.mapStatusToBadgeProps(statusVal)}
            />
          );
        },
      },
      {
        dataIndex: 'createdAt',
        title: created_on_label,
        sortable: true,
        render: (value) => {
          if (!value) return '';

          const date = new Date(String(value));

          return (
            <span className="text-xs text-muted-foreground font-medium">
              <FormattedDate value={date} />
            </span>
          );
        },
      },
      {
        dataIndex: 'id',
        title: '',
        sortable: false,
        render: () => {
          return (
            <Button variant="ghost" size="icon">
              <Ellipsis />
            </Button>
          );
        },
      },
    ];
  }, [t]);

  const search_placeholder_text = t('ledger-accounts:search_placeholder');
  const add_account_text = t('ledger-accounts:add_account');

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-sm">
          <SearchField
            type="search"
            placeholder={search_placeholder_text}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button onClick={onAddAccount}>
          <Plus />
          {add_account_text}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        selectable={selectable}
        selectedRowIds={selectedRowIds}
        onRowSelectionChange={onRowSelectionChange}
        stickyHeader={stickyHeader}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
        currentSortKey={currentSortKey}
        currentSortDirection={currentSortDirection}
        className={className}
        data-testid={dataTestId}
        filters={filters}
      />
      {pagination && onPageChange && (
        <TablePagination
          meta={pagination}
          onPageChange={onPageChange}
          className="mx-0 w-auto justify-end"
        />
      )}
    </div>
  );
}
