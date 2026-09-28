import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryRouteMapper } from '@/journal-entries/lib/mappers/journal-entry-route.mapper';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useTableQueryParams } from '@/shared/hooks/use-table-query-params';
import {
  EJournalEntrySortBy,
  EPaginationSortDirection,
  type IGetJournalEntriesQuery,
  type IJournalEntryListDto,
} from '@/shared/lib/api/Api';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TransactionsTableContainerProps } from '../types';

const TRANSACTIONS_PAGE_SIZE = 10;

export function TransactionsTableContainer({
  actionButton,
}: Readonly<TransactionsTableContainerProps>) {
  const navigate = useNavigate();
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: archive, isPending: archiving } =
    useArchiveJournalEntry();
  const { mutateAsync: deleteEntry } = useDeleteJournalEntry();
  const tableQuery = useTableQueryParams<'effectiveDate'>({
    defaultSortKey: EJournalEntrySortBy.EffectiveDate,
    defaultSortDirection: EPaginationSortDirection.Desc,
  });
  const debouncedSearchQuery = useDebounce(tableQuery.searchQuery, 300);

  const query = useMemo<IGetJournalEntriesQuery>(
    () => ({
      page: tableQuery.page,
      limit: TRANSACTIONS_PAGE_SIZE,
      ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
      orderBy: EJournalEntrySortBy.EffectiveDate,
      sortDirection: tableQuery.sortDirection ?? EPaginationSortDirection.Desc,
    }),
    [debouncedSearchQuery, tableQuery.page, tableQuery.sortDirection]
  );

  const { data: journalEntries, isPending } = useJournalEntries(query);

  const handleSortChange = useCallback(
    (_key: 'effectiveDate', direction: 'asc' | 'desc' | null) => {
      tableQuery.handleSortChange(
        EJournalEntrySortBy.EffectiveDate,
        direction ?? EPaginationSortDirection.Asc
      );
    },
    [tableQuery]
  );

  const handleEditTransaction = useCallback(
    (journalEntry: IJournalEntryListDto) => {
      const routeType = journalEntryRouteMapper.toRouteType(
        journalEntry.sourceType
      );

      if (!routeType) return;

      navigate(`/transactions/${routeType}/${journalEntry.id}/edit`);
    },
    [navigate]
  );

  const handleArchiveTransaction = async (entry: IJournalEntryListDto) => {
    if (archiving) return;
    try {
      await archive({
        id: entry.id,
        payload: { expectedVersion: entry.version },
      });
      navigate('/transactions');
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const handleDeleteTransaction = async (entry: IJournalEntryListDto) => {
    try {
      await deleteEntry({
        id: entry.id,
        payload: { expectedVersion: entry.version },
      });
      navigate('/transactions');
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  return (
    <TransactionsTable
      actionButton={actionButton}
      data={journalEntries?.data ?? []}
      loading={isPending}
      archiving={archiving}
      onArchiveTransaction={handleArchiveTransaction}
      onDeleteTransaction={handleDeleteTransaction}
      pagination={journalEntries?.meta}
      onEditTransaction={handleEditTransaction}
      onPageChange={tableQuery.handlePageChange}
      onSortChange={handleSortChange}
      currentSortDirection={tableQuery.sortDirection}
      searchValue={tableQuery.searchQuery}
      onSearchChange={tableQuery.handleSearchChange}
    />
  );
}
