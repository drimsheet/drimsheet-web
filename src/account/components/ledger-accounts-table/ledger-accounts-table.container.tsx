import { useLedgerAccounts } from '@/account/hooks/use-ledger-accounts';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import {
  ELedgerAccountStatus,
  type IGetLedgerAccountsQuery,
  type ILedgerAccountDto,
  type ULedgerAccountSortBy,
} from '@/shared/lib/api/Api';
import { useMemo, useState } from 'react';
import { LedgerAccountsTable } from './ledger-accounts-table';

interface LedgerAccountsTableContainerProps {
  onAddAccount: () => void;
}

export function LedgerAccountsTableContainer({
  onAddAccount,
}: Readonly<LedgerAccountsTableContainerProps>) {
  const tableQuery = useTableQueryParams<keyof ILedgerAccountDto, 'status'>({
    filterKeys: ['status'],
  });

  const debouncedSearchQuery = useDebounce(tableQuery.searchQuery, 300);
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);
  const limit = 10;

  const query = useMemo<IGetLedgerAccountsQuery>(() => {
    const sortKeyMap: Partial<
      Record<keyof ILedgerAccountDto, ULedgerAccountSortBy>
    > = {
      name: 'accountName',
      createdAt: 'createdAt',
      balance: 'balance',
    };

    const orderBy = tableQuery.sortKey
      ? sortKeyMap[tableQuery.sortKey]
      : undefined;

    const baseFilters = ledgerAccountService.getPettyBaseCashFilters();

    const selectedStatus = tableQuery.filters.status?.[0];

    const status =
      selectedStatus === ELedgerAccountStatus.Active ||
      selectedStatus === ELedgerAccountStatus.Archived
        ? selectedStatus
        : undefined;

    return {
      ...baseFilters,
      status,
      search: debouncedSearchQuery || undefined,
      orderBy,
      sortDirection: tableQuery.sortDirection || undefined,
      page: tableQuery.page,
      limit,
    };
  }, [
    debouncedSearchQuery,
    tableQuery.sortKey,
    tableQuery.sortDirection,
    tableQuery.page,
    tableQuery.filters.status,
  ]);

  const { data: accountsData, isLoading } = useLedgerAccounts(query);

  return (
    <LedgerAccountsTable
      onAddAccount={onAddAccount}
      data={accountsData?.data ?? []}
      loading={isLoading}
      selectable
      selectedRowIds={selectedRowIds}
      onRowSelectionChange={setSelectedRowIds}
      onSortChange={tableQuery.handleSortChange}
      onFilterChange={tableQuery.handleFilterChange}
      currentSortKey={tableQuery.sortKey as string}
      currentSortDirection={tableQuery.sortDirection}
      searchValue={tableQuery.searchQuery}
      onSearchChange={tableQuery.handleSearchChange}
      filters={tableQuery.filters}
      pagination={accountsData?.meta}
      onPageChange={tableQuery.handlePageChange}
    />
  );
}
