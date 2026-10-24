import { TransactionsTable } from '@/journal-entries/components/transactions-table';
import { useArchiveJournalEntry } from '@/journal-entries/hooks/use-archive-journal-entry';
import { useDeleteJournalEntry } from '@/journal-entries/hooks/use-delete-journal-entry';
import { useJournalEntries } from '@/journal-entries/hooks/use-journal-entries';
import { journalEntryRouteMapper } from '@/journal-entries/lib/mappers/journal-entry-route.mapper';
import { SearchField } from '@/shared/components/search-field';
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
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TransactionsTableContainerProps } from '../types';

const TRANSACTIONS_PAGE_SIZE = 10;

export function TransactionsTableContainer({
  actionButton,
}: Readonly<TransactionsTableContainerProps>) {
  const { t } = useTranslation('journal-entries');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('accountId') || undefined;
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
      accountId,
      ...(debouncedSearchQuery ? { search: debouncedSearchQuery } : {}),
      orderBy: EJournalEntrySortBy.EffectiveDate,
      sortDirection: tableQuery.sortDirection ?? EPaginationSortDirection.Desc,
    }),
    [accountId, debouncedSearchQuery, tableQuery.page, tableQuery.sortDirection]
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
      await archive(entry.id);
      navigate('/transactions');
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const handleDeleteTransaction = async (entry: IJournalEntryListDto) => {
    try {
      await deleteEntry(entry.id);
      navigate('/transactions');
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  const search_placeholder = t('transactions_table_search_placeholder');

  return (
    <div className="flex min-w-0 w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <SearchField
            type="search"
            aria-label={search_placeholder}
            placeholder={search_placeholder}
            value={tableQuery.searchQuery}
            onChange={(event) =>
              tableQuery.handleSearchChange(event.target.value)
            }
          />
        </div>
        {actionButton}
      </div>
      <TransactionsTable
        accountId={accountId}
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
      />
    </div>
  );
}
